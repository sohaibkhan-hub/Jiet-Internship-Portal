import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Branch } from "../models/branch.model.js";
import { Domain } from "../models/domain.model.js";

// ============= BRANCH CONTROLLERS =============

// Get All Branches
const getAllBranches = asyncHandler(async (req, res) => {
  const { isActive, programType } = req.query;

  const filter = {};

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  if (programType) {
    filter.programType = programType;
  }

  const branches = await Branch.find(filter).sort({ name: 1 });

  if (!branches || branches.length === 0) {
    throw new ApiError(404, "No branches found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, branches, "Branches fetched successfully")
    );
});

// Get Branch by ID
const getBranchById = asyncHandler(async (req, res) => {
  const { branchId } = req.params;

  const branch = await Branch.findById(branchId);

  if (!branch) {
    throw new ApiError(404, "Branch not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, branch, "Branch fetched successfully")
    );
});

// Create Branch (Admin only)
const createBranch = asyncHandler(async (req, res) => {
  const { college, name, code, externalBranchDetails, programType, hodName, hodEmail } = req.body;

  // Validate required fields
  if (!college || !name || !code || !externalBranchDetails || !programType) {
    throw new ApiError(400, "College, name, code, externalBranchDetails, and programType are required");
  }

  // Check if branch with same code already exists
  const existingBranch = await Branch.findOne({ code: code.toUpperCase() });
  if (existingBranch) {
    throw new ApiError(409, "Branch with this code already exists");
  }

  const newBranch = await Branch.create({
    college,
    name,
    externalMappings: externalBranchDetails,
    code: code.toUpperCase(),
    programType,
    hodName: hodName || "",
    hodEmail: hodEmail || "",
    isActive: true,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, newBranch, "Branch created successfully")
    );
});

// Update Branch
const updateBranch = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const {
    college,
    name,
    code,
    programType,
    hodName,
    hodEmail,
    externalBranchDetails,
    isActive,
  } = req.body;

  const branch = await Branch.findById(branchId);

  if (!branch) {
    throw new ApiError(404, "Branch not found");
  }

  if (code) {
    const existingBranch = await Branch.findOne({
      code: code.toUpperCase(),
      _id: { $ne: branchId },
    });
    if (existingBranch) {
      throw new ApiError(409, "Branch with this code already exists");
    }
    branch.code = code.toUpperCase();
  }

  if (college) branch.college = college;
  if (name) branch.name = name;
  if (programType) branch.programType = programType;
  if (hodName) branch.hodName = hodName;
  if (hodEmail) branch.hodEmail = hodEmail;
  if (externalBranchDetails) branch.externalMappings = externalBranchDetails;
  if (isActive !== undefined) branch.isActive = isActive;

  await branch.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, branch, "Branch updated successfully")
    );
});

// Delete Branch
const deleteBranch = asyncHandler(async (req, res) => {
  const { branchId } = req.params;

  const branch = await Branch.findById(branchId);

  if (!branch) {
    throw new ApiError(404, "Branch not found");
  }

  await branch.deleteOne();

  return res
    .status(200)
    .json(
      new ApiResponse(200, branch, "Branch deleted successfully")
    );
});

// ============= DOMAIN CONTROLLERS =============

// Get All Domains
const getAllDomains = asyncHandler(async (req, res) => {
  const { isActive } = req.query;

  const filter = {};

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const domains = await Domain.find(filter).sort({ name: 1 });

  if (!domains || domains.length === 0) {
    throw new ApiError(404, "No domains found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, domains, "Domains fetched successfully")
    );
});

// Get Domains by Stream (Filters applicable domains for a student stream)
const getDomainsByName = asyncHandler(async (req, res) => {
  const { domainName } = req.body;

  if (!domainName) {
    throw new ApiError(400, "Domain name parameter is required");
  }

  const domains = await Domain.find({
      name: domainName,
      isActive: true,
  }).sort({ name: 1 });

  if (!domains || domains.length === 0) {
    throw new ApiError(404, `No domains found for stream: ${domainName}`);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, domains, `Domains for stream "${domainName}" fetched successfully`)
    );
});

// Get Domain by ID
const getDomainById = asyncHandler(async (req, res) => {
  const { domainId } = req.params;

  const domain = await Domain.findById(domainId);

  if (!domain) {
    throw new ApiError(404, "Domain not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, domain, "Domain fetched successfully")
    );
});

// Create Domain (Admin only)
const createDomain = asyncHandler(async (req, res) => {
  const { name, description, applicableBranches } = req.body;

  // Validate required fields
  if (!name) {
    throw new ApiError(400, "Domain name is required");
  }

  // Check if domain with same name already exists
  const existingDomain = await Domain.findOne({ name });
  if (existingDomain) {
    throw new ApiError(409, "Domain with this name already exists");
  }

  // check branch exist or not in array
  if (applicableBranches && applicableBranches.length > 0) {
    for (const branchId of applicableBranches) {
      const branch = await Branch.findById(branchId);
      if (!branch) {
        throw new ApiError(400, `Branch with ID ${branchId} does not exist`);
      }
    }
  }

  const newDomain = await Domain.create({
    name,
    description: description || "",
    applicableBranches: applicableBranches || [],
    isActive: true,
  });

  if (!newDomain) {
    throw new ApiError(500, "Failed to create domain");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, newDomain, "Domain created successfully")
    );
});

// Get Alll Domain by BranchId
const getDomainsByBranchId = asyncHandler(async (req, res) => {
  const { branchId } = req.params;

  // Check if branch exists
  const branch = await Branch.findById(branchId);
  if (!branch) {
    throw new ApiError(404, "Branch not found");
  }

  // Find domains applicable to the branch
  const domains = await Domain.find({
    applicableBranches: branchId,
    isActive: true,
  }).sort({ name: 1 });

  if (!domains || domains.length === 0) {
    throw new ApiError(404, "No domains found for this branch");
  }

  // Remove applicableBranches from each domain object before sending response
  const domainsWithoutBranches = domains.map(domain => {
    const d = domain.toObject();
    delete d.applicableBranches;
    delete d.description;
    return d;
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, domainsWithoutBranches, "Domains fetched successfully for the branch")
    );
});

// Update Domain
const updateDomain = asyncHandler(async (req, res) => {
  const { domainId } = req.params;
  const { name, description, applicableBranches, isActive } = req.body;

  const domain = await Domain.findById(domainId);

  if (!domain) {
    throw new ApiError(404, "Domain not found");
  }

  if (name) {
    const existingDomain = await Domain.findOne({ name, _id: { $ne: domainId } });
    if (existingDomain) {
      throw new ApiError(409, "Domain with this name already exists");
    }
    domain.name = name;
  }
  if (description) domain.description = description;
  if (applicableBranches) {
    for (const branchId of applicableBranches) {
      const branch = await Branch.findById(branchId);
      if (!branch) {
        throw new ApiError(400, `Branch with ID ${branchId} does not exist`);
      }
    }
    domain.applicableBranches = applicableBranches;
  }
  if (isActive !== undefined) domain.isActive = isActive;

  await domain.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, domain, "Domain updated successfully")
    );
});

// Delete Domain
const deleteDomain = asyncHandler(async (req, res) => {
  const { domainId } = req.params;

  const domain = await Domain.findById(domainId);

  if (!domain) {
    throw new ApiError(404, "Domain not found");
  }

  await domain.deleteOne();

  return res
    .status(200)
    .json(
      new ApiResponse(200, domain, "Domain deleted successfully")
    );
});

export {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  getAllDomains,
  getDomainsByName,
  getDomainById,
  createDomain,
  updateDomain,
  deleteDomain,
  getDomainsByBranchId,
};
