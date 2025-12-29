import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Student } from "../models/student.model.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Domain } from "../models/domain.model.js";

// Get All Student Applications (Main TPO Dashboard)
const getAllStudentApplications = asyncHandler(async (req, res) => {
  const { status, branch, sortBy } = req.query;

  const filter = {
    "internshipData.isFormSubmitted": true,
  };

  if (status) {
    filter["internshipData.allocationStatus"] = status;
  }

  if (branch) {
    filter.branch = branch;
  }

  let sort = { createdAt: -1 };
  if (sortBy === "rollNumber") {
    sort = { rollNumber: 1 };
  }

  const applications = await Student.find(filter)
    .populate("user", "email firstName lastName")
    .populate("branch", "name code programType")
    .populate("internshipData.choices.company", "name domainTags")
    .populate("internshipData.allocatedCompany", "name")
    .sort(sort);

  if (!applications || applications.length === 0) {
    throw new ApiError(404, "No student applications found");
  }

  const applicationsSummary = applications.map((student) => ({
    _id: student._id,
    rollNumber: student.rollNumber,
    fullName: student.fullName,
    email: student.user?.email,
    branch: student.branch?.name,
    cgpa: student.currentCgpa,
    backlogs: student.activeBacklogs,
    approvalStatus: student.internshipData.approvalStatus,
    allocationStatus: student.internshipData.allocationStatus,
    allocatedCompany: student.internshipData.allocatedCompany?.name,
    choicesCount: student.internshipData.choices.length,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        applicationsSummary,
        "Student applications fetched successfully"
      )
    );
});

// Get Student Details with Choices
const getStudentApplicationDetails = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const student = await Student.findById(studentId)
    .populate("user", "email firstName lastName")
    .populate("branch", "name code programType specializations")
    .populate("internshipData.choices.company", "name location minCgpa maxBacklogs domainTags")
    .populate("internshipData.preferredDomains", "name description")
    .populate("internshipData.allocatedCompany", "name location");

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        student,
        "Student application details fetched successfully"
      )
    );
});

// Filter Students by Status
const filterStudentsByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;

  const validStatuses = ["NOT_ALLOCATED", "ALLOCATED", "WAITLISTED"];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const students = await Student.find({
    "internshipData.allocationStatus": status,
    "internshipData.isFormSubmitted": true,
  })
    .populate("user", "email")
    .populate("branch", "name code")
    .populate("internshipData.allocatedCompany", "name")
    .sort({ rollNumber: 1 });

  if (!students || students.length === 0) {
    throw new ApiError(404, `No students found with status: ${status}`);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, students, `Students with status "${status}" fetched successfully`)
    );
});

// Filter Students by Approval Status
const filterStudentsByApprovalStatus = asyncHandler(async (req, res) => {
  const { approvalStatus } = req.params;

  const validStatuses = ["PENDING_REVIEW", "APPROVED_BY_TPO", "REJECTED"];

  if (!validStatuses.includes(approvalStatus)) {
    throw new ApiError(
      400,
      `Invalid approval status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  const students = await Student.find({
    "internshipData.approvalStatus": approvalStatus,
  })
    .populate("user", "email firstName lastName")
    .populate("branch", "name code")
    .sort({ rollNumber: 1 });

  if (!students || students.length === 0) {
    throw new ApiError(404, `No students found with approval status: ${approvalStatus}`);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        students,
        `Students with approval status "${approvalStatus}" fetched successfully`
      )
    );
});

// Approve Student Application
const approveStudentApplication = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const student = await Student.findById(studentId);

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  if (!student.internshipData.isFormSubmitted) {
    throw new ApiError(400, "Student has not submitted their application form");
  }

  student.internshipData.approvalStatus = "APPROVED_BY_TPO";
  await student.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, student, "Student application approved successfully")
    );
});

// Reject Student Application
const rejectStudentApplication = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { reason } = req.body;

  const student = await Student.findById(studentId);

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  student.internshipData.approvalStatus = "REJECTED";
  await student.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        student,
        `Student application rejected${reason ? ` - Reason: ${reason}` : ""}`
      )
    );
});

// Get Placement Stats (Domain-wise count report)
const getPlacementStats = asyncHandler(async (req, res) => {
  // Get all allocated students
  const allocatedStudents = await Student.find({
    "internshipData.allocationStatus": "ALLOCATED",
  })
    .populate("internshipData.allocatedCompany");

  // Get all waitlisted students
  const waitlistedStudents = await Student.find({
    "internshipData.allocationStatus": "WAITLISTED",
  });

  // Get all not allocated students
  const notAllocatedStudents = await Student.find({
    "internshipData.allocationStatus": "NOT_ALLOCATED",
  });

  // Get stats by domain
  const domainStats = await Student.aggregate([
    {
      $match: {
        "internshipData.allocationStatus": "ALLOCATED",
      },
    },
    {
      $lookup: {
        from: "companies",
        localField: "internshipData.allocatedCompany",
        foreignField: "_id",
        as: "company",
      },
    },
    {
      $unwind: "$company",
    },
    {
      $unwind: "$company.domainTags",
    },
    {
      $lookup: {
        from: "domains",
        localField: "company.domainTags",
        foreignField: "_id",
        as: "domain",
      },
    },
    {
      $unwind: "$domain",
    },
    {
      $group: {
        _id: "$domain.name",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  // Get stats by branch
  const branchStats = await Student.aggregate([
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
      $sort: { total: -1 },
    },
  ]);

  const stats = {
    summary: {
      totalStudents: allocatedStudents.length + waitlistedStudents.length + notAllocatedStudents.length,
      allocated: allocatedStudents.length,
      waitlisted: waitlistedStudents.length,
      notAllocated: notAllocatedStudents.length,
      allocationRate: `${Math.round((allocatedStudents.length / (allocatedStudents.length + waitlistedStudents.length + notAllocatedStudents.length)) * 100)}%`,
    },
    domainStats,
    branchStats,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, stats, "Placement statistics fetched successfully")
    );
});

// Get Students Pending for Approval
const getPendingApprovals = asyncHandler(async (req, res) => {
  const students = await Student.find({
    "internshipData.approvalStatus": "PENDING_REVIEW",
    "internshipData.isFormSubmitted": true,
  })
    .populate("user", "email firstName lastName")
    .populate("branch", "name code")
    .populate("internshipData.choices.company", "name minCgpa maxBacklogs")
    .sort({ createdAt: 1 });

  if (!students || students.length === 0) {
    throw new ApiError(404, "No students pending for approval");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, students, "Pending approvals fetched successfully")
    );
});

export {
  getAllStudentApplications,
  getStudentApplicationDetails,
  filterStudentsByStatus,
  filterStudentsByApprovalStatus,
  approveStudentApplication,
  rejectStudentApplication,
  getPlacementStats,
  getPendingApprovals,
};
