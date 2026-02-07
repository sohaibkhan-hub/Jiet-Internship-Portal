import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Company } from "../models/company.model.js";
import { Branch } from "../models/branch.model.js";
import { Domain } from "../models/domain.model.js";
import { User } from "../models/user.model.js";

// Create Company (TPO only)
const addCompany = asyncHandler(async (req, res) => {
  const {
    name,
    location,
    domainTags,
    allowedBranches,
    totalSeats,
    stipendAmount,
    recruitmentStatus,
  } = req.body;

  if (req.user.role !== "ADMIN" && req.user.role !== "FACULTY") {
    throw new ApiError(403, "Only faculty and admin can add companies");
  }
  
  // Validate required fields
  if (!name || !totalSeats) {
    throw new ApiError(400, "Company name and total seats are required");
  }

  if (!domainTags.length === 0) {
    // Verify domainTags
    const validDomains = await Domain.find({ _id: { $in: domainTags } });
    if (validDomains.length !== domainTags.length) {  
      throw new ApiError(400, "One or more provided domain IDs are invalid");
    }
  }

  if (!allowedBranches.length === 0) {
    // Verify allowedBranches
    const validBranches = await Branch.find({ _id: { $in: allowedBranches } });
    if (validBranches.length !== allowedBranches.length) {
      throw new ApiError(400, "One or more provided branch IDs are invalid");
    }
  }

  // Check if company already exists
  const existingCompany = await Company.findOne({ name });
  if (existingCompany) {
    throw new ApiError(409, "Company with this name already exists");
  }

  const newCompany = await Company.create({
    name,
    location: location || {},
    domainTags: domainTags || [],
    allowedBranches: allowedBranches || [],
    totalSeats,
    stipendAmount: stipendAmount || 'N/A',
    recruitmentStatus: recruitmentStatus || "OPEN",
  });

  if (!newCompany) {
    throw new ApiError(500, "Failed to add new company");
  }

  return res
    .status(201)
    .json( new ApiResponse(201, newCompany, "New Company added successfully") );
});

// Get All Companies (TPO Dashboard)
const getAllCompanies = asyncHandler(async (req, res) => {
  const { recruitmentStatus } = req.query;

  const filter = {};

  if (recruitmentStatus) {
    filter.recruitmentStatus = recruitmentStatus;
  }

  const companies = await Company.find(filter)
    .populate("domainTags", "name")
    .populate("allowedBranches", "name code")
    .sort({ createdAt: -1 });

  if (!companies || companies.length === 0) {
    throw new ApiError(404, "No companies found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, companies, "Companies fetched successfully")
    );
});

// Get Company by ID
const getCompanyById = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  const company = await Company.findById(companyId)
    .populate("domainTags", "name description")
    .populate("allowedBranches", "name code programType specializations");

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, company, "Company fetched successfully")
    );
});

// Get Companies for Student (Filtered based on Student's eligibility)
const getCompaniesForStudent = asyncHandler(async (req, res) => {
  const { branchId, currentCgpa, activeBacklogs } = req.query;

  if (!branchId || currentCgpa === undefined) {
    throw new ApiError(
      400,
      "Branch ID and current CGPA are required"
    );
  }

  const filter = {
    recruitmentStatus: "OPEN",
    $expr: { $gt: [{ $subtract: ["$totalSeats", "$filledSeats"] }, 0] }, // Seats available
    minCgpa: { $lte: parseFloat(currentCgpa) }, // Student meets CGPA requirement
    maxBacklogs: { $gte: parseInt(activeBacklogs) || 0 }, // Student meets backlog requirement
  };

  // Check if branch is in allowedBranches or allowedBranches is empty
  const company = await Company.findOne({
    ...filter,
    $or: [
      { allowedBranches: { $size: 0 } }, // No branch restrictions
      { allowedBranches: branchId }, // Student's branch is allowed
    ],
  });

  const companies = await Company.find({
    ...filter,
    $or: [
      { allowedBranches: { $size: 0 } },
      { allowedBranches: branchId },
    ],
  })
    .populate("domainTags", "name description")
    .sort({ createdAt: -1 });

  if (!companies || companies.length === 0) {
    throw new ApiError(
      404,
      "No eligible companies found for your profile"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        companies,
        "Eligible companies fetched successfully"
      )
    );
});

// Update Company Details
const updateCompanyDetails = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const {
    name,
    location,
    domainTags,
    allowedBranches,
    totalSeats,
    stipendAmount,
    recruitmentStatus,
  } = req.body;

  const company = await Company.findById(companyId);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  if (name) {
    const existingCompany = await Company.findOne({
      name,
      _id: { $ne: companyId },
    });
    if (existingCompany) {
      throw new ApiError(409, "Company with this name already exists");
    }
  }

  if (Array.isArray(domainTags) && domainTags.length > 0) {
    const validDomains = await Domain.find({ _id: { $in: domainTags } });
    if (validDomains.length !== domainTags.length) {
      throw new ApiError(400, "One or more provided domain IDs are invalid");
    }
  }

  if (Array.isArray(allowedBranches) && allowedBranches.length > 0) {
    const validBranches = await Branch.find({ _id: { $in: allowedBranches } });
    if (validBranches.length !== allowedBranches.length) {
      throw new ApiError(400, "One or more provided branch IDs are invalid");
    }
  }

  if (name) company.name = name;
  if (location) company.location = location;
  if (domainTags) company.domainTags = domainTags;
  if (allowedBranches) company.allowedBranches = allowedBranches;
  if (totalSeats !== undefined) company.totalSeats = totalSeats;
  if (stipendAmount !== undefined) company.stipendAmount = stipendAmount;
  if (recruitmentStatus) company.recruitmentStatus = recruitmentStatus;

  await company.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, company, "Company updated successfully")
    );
});

// Delete Company
const deleteCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  const company = await Company.findById(companyId);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  await company.deleteOne();

  return res
    .status(200)
    .json(
      new ApiResponse(200, company, "Company deleted successfully")
    );
});

// Update Company Seats
const updateCompanySeats = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const { totalSeats } = req.body;

  if (totalSeats === undefined || totalSeats < 1) {
    throw new ApiError(400, "Total seats must be at least 1");
  }

  const company = await Company.findById(companyId);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  if (totalSeats < company.filledSeats) {
    throw new ApiError( 400,`Cannot reduce seats below filled seats (${company.filledSeats})` );
  }

  company.totalSeats = totalSeats;
  await company.save();

  return res
    .status(200)
    .json( new ApiResponse(200, company, "Company seats updated successfully"));
});

// Get Company Seat Status
const getCompanySeats = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  const company = await Company.findById(companyId);

  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  const availableSeats = company.totalSeats - company.filledSeats;

  const seatStatus = {
    companyName: company.name,
    totalSeats: company.totalSeats,
    filledSeats: company.filledSeats,
    availableSeats,
    occupancyPercentage: Math.round(
      (company.filledSeats / company.totalSeats) * 100
    ),
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, seatStatus, "Seat status fetched successfully")
    );
});

// get all companies with branch details
const getAllCompaniesWithBranch = asyncHandler(async (req, res) => {

  const branchId = req.query.branchId;

  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.role !== "ADMIN" && user.role !== "TPO") {
    throw new ApiError(403, "Only admin and TPO can register students");
  }

  let filter = {};
  if (branchId) {
    // Only companies where allowedBranches contains branchId
    filter = { allowedBranches: branchId };
  }

  const companies = await Company.find(filter)
    .populate("allowedBranches", "name code programType specializations")
    .populate("domainTags", "name description");

  if (!companies || companies.length === 0) {
    throw new ApiError(404, "No companies found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, companies, "Companies with details fetched successfully")
    );
});

export {
  addCompany,
  getAllCompanies,
  getCompanyById,
  getCompaniesForStudent,
  updateCompanyDetails,
  updateCompanySeats,
  getCompanySeats,
  getAllCompaniesWithBranch,
  deleteCompany,
};
