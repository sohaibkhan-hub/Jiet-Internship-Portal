import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Student } from "../models/student.model.js";
import { Company } from "../models/company.model.js";

// ============= CORE ALLOCATION ALGORITHM =============

/**
 * Trigger Batch Allocation
 * Runs the seat allocation logic for all approved students
 *
 * Algorithm:
 * 1. Fetch all students with APPROVED_BY_TPO status
 * 2. Sort students by CGPA (highest first) for fairness
 * 3. For each student, process their choices in priority order
 * 4. Allocate seats atomically
 * 5. Mark as ALLOCATED or WAITLISTED based on seat availability
 */
const triggerBatchAllocation = asyncHandler(async (req, res) => {
  // Step 1: Fetch all approved students with their choices
  const approvedStudents = await Student.find({
    "internshipData.approvalStatus": "APPROVED_BY_TPO",
    "internshipData.allocationStatus": "NOT_ALLOCATED",
    "internshipData.isFormSubmitted": true,
  })
    .populate("internshipData.choices.company")
    .sort({ currentCgpa: -1 }); // Sort by CGPA (highest first)

  if (!approvedStudents || approvedStudents.length === 0) {
    throw new ApiError(
      404,
      "No students found for allocation"
    );
  }

  const allocationResults = {
    allocated: [],
    waitlisted: [],
    failed: [],
    totalProcessed: 0,
  };

  // Step 2 & 3: Process each student's choices
  for (const student of approvedStudents) {
    if (!student.internshipData.choices || student.internshipData.choices.length === 0) {
      allocationResults.failed.push({
        studentId: student._id,
        reason: "No choices submitted",
      });
      continue;
    }

    let allocated = false;

    // Process choices in priority order
    for (const choice of student.internshipData.choices) {
      if (allocated) break;

      const company = await Company.findById(choice.company);

      if (!company) {
        continue;
      }

      // Check if student meets company criteria
      if (
        student.currentCgpa < company.minCgpa ||
        student.activeBacklogs > company.maxBacklogs
      ) {
        continue;
      }

      // Check if seats are available
      const availableSeats = company.totalSeats - company.filledSeats;

      if (availableSeats > 0) {
        // ATOMIC INCREMENT: Increment filledSeats
        const updatedCompany = await Company.findByIdAndUpdate(
          choice.company,
          { $inc: { filledSeats: 1 } },
          { new: true }
        );

        // Allocate student to company
        student.internshipData.allocatedCompany = choice.company;
        student.internshipData.allocationStatus = "ALLOCATED";
        student.internshipData.allocatedDate = new Date();
        await student.save();

        allocationResults.allocated.push({
          studentId: student._id,
          studentRoll: student.rollNumber,
          companyName: company.name,
          priority: choice.priority,
        });

        allocated = true;
      }
    }

    // If not allocated after all choices, mark as WAITLISTED
    if (!allocated) {
      student.internshipData.allocationStatus = "WAITLISTED";
      student.internshipData.allocatedDate = new Date();
      await student.save();

      allocationResults.waitlisted.push({
        studentId: student._id,
        studentRoll: student.rollNumber,
        reason: "No seat available in preferred companies",
      });
    }

    allocationResults.totalProcessed++;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allocationResults,
        "Batch allocation completed successfully"
      )
    );
});

// ============= ALLOCATION UTILITIES =============

// Get Allocation Status Overview
const getAllocationStatus = asyncHandler(async (req, res) => {
  const totalStudents = await Student.countDocuments({
    "internshipData.isFormSubmitted": true,
  });

  const allocatedCount = await Student.countDocuments({
    "internshipData.allocationStatus": "ALLOCATED",
  });

  const waitlistedCount = await Student.countDocuments({
    "internshipData.allocationStatus": "WAITLISTED",
  });

  const notAllocatedCount = await Student.countDocuments({
    "internshipData.allocationStatus": "NOT_ALLOCATED",
  });

  const allocationStatus = {
    totalStudents,
    allocated: allocatedCount,
    waitlisted: waitlistedCount,
    notAllocated: notAllocatedCount,
    allocationPercentage: Math.round(
      (allocatedCount / (allocatedCount + waitlistedCount + notAllocatedCount)) *
        100
    ),
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allocationStatus,
        "Allocation status fetched successfully"
      )
    );
});

// Reset Allocation (Emergency function)
const resetAllocation = asyncHandler(async (req, res) => {
  const { confirmReset } = req.body;

  if (!confirmReset) {
    throw new ApiError(
      400,
      "Confirmation required to reset allocation. Set confirmReset to true."
    );
  }

  // Reset all students' allocation status
  const result = await Student.updateMany(
    { "internshipData.isFormSubmitted": true },
    {
      $set: {
        "internshipData.allocationStatus": "NOT_ALLOCATED",
        "internshipData.allocatedCompany": null,
        "internshipData.allocatedDate": null,
      },
    }
  );

  // Reset all companies' filled seats
  const companyResult = await Company.updateMany(
    {},
    { $set: { filledSeats: 0 } }
  );

  const resetResults = {
    studentsReset: result.modifiedCount,
    companiesReset: companyResult.modifiedCount,
    message: "Allocation has been reset. You can run triggerBatchAllocation again.",
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        resetResults,
        "Allocation reset successfully"
      )
    );
});

// Export Allocation List (CSV/Excel format)
const exportAllocationList = asyncHandler(async (req, res) => {
  const allocatedStudents = await Student.find({
    "internshipData.allocationStatus": "ALLOCATED",
  })
    .populate("user", "email")
    .populate("branch", "name code")
    .populate("internshipData.allocatedCompany", "name location")
    .sort({ rollNumber: 1 });

  if (!allocatedStudents || allocatedStudents.length === 0) {
    throw new ApiError(404, "No allocated students found");
  }

  // Format data for export
  const exportData = allocatedStudents.map((student) => ({
    "Roll Number": student.rollNumber,
    "Student Name": student.fullName,
    "Email": student.user?.email,
    "Branch": student.branch?.name,
    "CGPA": student.currentCgpa,
    "Backlogs": student.activeBacklogs,
    "Allocated Company": student.internshipData.allocatedCompany?.name,
    "Company Location": student.internshipData.allocatedCompany?.location,
    "Allocation Date": new Date(
      student.internshipData.allocatedDate
    ).toLocaleDateString(),
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        exportData,
        "Allocation list exported successfully"
      )
    );
});

// Get Company-wise Allocation
const getCompanyWiseAllocation = asyncHandler(async (req, res) => {
  const companyAllocation = await Student.aggregate([
    {
      $match: {
        "internshipData.allocationStatus": "ALLOCATED",
      },
    },
    {
      $group: {
        _id: "$internshipData.allocatedCompany",
        count: { $sum: 1 },
        students: {
          $push: {
            rollNumber: "$rollNumber",
            name: "$fullName",
          },
        },
      },
    },
    {
      $lookup: {
        from: "companies",
        localField: "_id",
        foreignField: "_id",
        as: "company",
      },
    },
    {
      $unwind: "$company",
    },
    {
      $project: {
        _id: 0,
        companyName: "$company.name",
        allocatedSeats: "$count",
        totalSeats: "$company.totalSeats",
        occupancyRate: {
          $round: [
            {
              $multiply: [
                { $divide: ["$count", "$company.totalSeats"] },
                100,
              ],
            },
            2,
          ],
        },
        students: 1,
      },
    },
    {
      $sort: { companyName: 1 },
    },
  ]);

  if (!companyAllocation || companyAllocation.length === 0) {
    throw new ApiError(404, "No allocation data found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        companyAllocation,
        "Company-wise allocation fetched successfully"
      )
    );
});

// Get Branch-wise Allocation Summary
const getBranchWiseAllocationSummary = asyncHandler(async (req, res) => {
  const branchAllocation = await Student.aggregate([
    {
      $match: {
        "internshipData.isFormSubmitted": true,
      },
    },
    {
      $lookup: {
        from: "branches",
        localField: "branch",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    {
      $unwind: "$branchDetails",
    },
    {
      $group: {
        _id: "$branchDetails.name",
        total: { $sum: 1 },
        allocated: {
          $sum: {
            $cond: [
              { $eq: ["$internshipData.allocationStatus", "ALLOCATED"] },
              1,
              0,
            ],
          },
        },
        waitlisted: {
          $sum: {
            $cond: [
              { $eq: ["$internshipData.allocationStatus", "WAITLISTED"] },
              1,
              0,
            ],
          },
        },
        notAllocated: {
          $sum: {
            $cond: [
              { $eq: ["$internshipData.allocationStatus", "NOT_ALLOCATED"] },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        branch: "$_id",
        totalStudents: "$total",
        allocated: 1,
        waitlisted: 1,
        notAllocated: 1,
        allocationRate: {
          $round: [
            {
              $multiply: [
                { $divide: ["$allocated", "$total"] },
                100,
              ],
            },
            2,
          ],
        },
      },
    },
    {
      $sort: { branch: 1 },
    },
  ]);

  if (!branchAllocation || branchAllocation.length === 0) {
    throw new ApiError(404, "No allocation data found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        branchAllocation,
        "Branch-wise allocation summary fetched successfully"
      )
    );
});

export {
  triggerBatchAllocation,
  getAllocationStatus,
  resetAllocation,
  exportAllocationList,
  getCompanyWiseAllocation,
  getBranchWiseAllocationSummary,
};
