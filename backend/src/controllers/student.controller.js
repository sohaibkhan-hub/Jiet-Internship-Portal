import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Student } from "../models/student.model.js";
import { User } from "../models/user.model.js";
import { FeatureSettings } from "../models/featureSettings.model.js";
import { Domain } from "../models/domain.model.js";
import { Company } from "../models/company.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";


// Get Student Profile
const getStudentProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId);

  if (!user || user.role !== "STUDENT") {
    throw new ApiError(403, "Not a student user");
  }

  const student = await Student.findOne({ user: userId })
    .populate("branch", "name code programType specializations")
    .populate("internshipData.preferredDomains", "name description");

  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, student, "Student profile fetched successfully")
    );
});

// Update Student Profile (Personal Details)
const updateStudentProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const {
    fullName,
    fatherName,
    dateOfBirth,
    gender,
    category,
    phoneNumber,
    parentPhoneNumber,
    educationHistory,
  } = req.body;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId);

  if (!user || user.role !== "STUDENT") {
    throw new ApiError(403, "Not a student user");
  }

  const student = await Student.findOne({ user: userId });

  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  // Update fields if provided
  if (fullName) student.fullName = fullName;
  if (fatherName) student.fatherName = fatherName;
  if (dateOfBirth) student.dateOfBirth = dateOfBirth;
  if (gender) student.gender = gender;
  if (category) student.category = category;

  if (phoneNumber) {
    student.contact.phoneNumber = phoneNumber;
  }

  if (parentPhoneNumber) {
    student.contact.parentPhoneNumber = parentPhoneNumber;
  }

  if (educationHistory && Array.isArray(educationHistory)) {
    student.educationHistory = educationHistory;
  }

  await student.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, student, "Student profile updated successfully")
    );
});

// Update domain
const updateStudentDomain = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { domains } = req.body; // Expecting an array of domain ObjectIds

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId);

  if (!user || user.role !== "STUDENT") {
    throw new ApiError(403, "Not a student user");
  }

  const student = await Student.findOne({ user: userId });

  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  if (!Array.isArray(domains) || domains.length === 0) {
    throw new ApiError(400, "Domains array is required");
  }

  // Fetch branchId from student
  const branchId = student.branch;
  if (!branchId) {
    throw new ApiError(400, "Student branch not found");
  }

  // Fetch all domains and verify
  const { Domain } = await import("../models/domain.model.js");
  const foundDomains = await Domain.find({ _id: { $in: domains }, isActive: true });

  if (foundDomains.length !== domains.length) {
    throw new ApiError(400, "One or more domains are invalid or inactive");
  }

  // Check if all domains are applicable to the student's branch
  const invalidDomains = foundDomains.filter(domain => {
    return !domain.applicableBranches.some(b => b.equals(branchId));
  });

  if (invalidDomains.length > 0) {
    throw new ApiError(400, `Some domains are not applicable to your branch: ${invalidDomains.map(d => d.name).join(", ")}`);
  }

  // Only update preferredDomains, do not overwrite other internshipData fields
  student.set("internshipData.preferredDomains", domains);
  await student.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Student preferred domains updated successfully")
    );
});

// Update Survey Preferences (Table 2 Data)
const updateSurveyPreferences = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const {
    isParticipating,
    alternativeCareerPath,
    expectedSalary,
    preferredDomains,
  } = req.body;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId);

  if (!user || user.role !== "STUDENT") {
    throw new ApiError(403, "Not a student user");
  }

  const student = await Student.findOne({ user: userId });

  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  // Update survey data
  if (isParticipating !== undefined) {
    student.internshipData.isParticipating = isParticipating;
  }

  if (isParticipating === false && alternativeCareerPath) {
    student.internshipData.alternativeCareerPath = alternativeCareerPath;
  }

  if (expectedSalary) {
    student.internshipData.expectedSalary = expectedSalary;
  }

  if (preferredDomains && Array.isArray(preferredDomains)) {
    student.internshipData.preferredDomains = preferredDomains;
  }

  await student.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        student,
        "Survey preferences updated successfully"
      )
    );
});

// Submit Internship Choices (4 Priority Choices, with companyId, domainId, location, priority)
const submitInternshipChoices = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  let { choices } = req.body;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId);
  if (!user || user.role !== "STUDENT") {
    throw new ApiError(403, "Not a student user");
  }

  // validate application already submitted
  const studentCheck = await Student.findOne({ user: userId });
  if (studentCheck.internshipData.isFormSubmitted) {
    throw new ApiError(400, "Internship choices have already been submitted and cannot be modified");
  }

  if (typeof choices === "string") {
    try {
      choices = JSON.parse(choices);
    } catch (err) {
      throw new ApiError(400, "Invalid choices format");
    }
  }

  if (!choices || !Array.isArray(choices) || choices.length === 0) {
    throw new ApiError(400, "At least one choice is required");
  }
  if (choices.length > 4) {
    throw new ApiError(400, "Maximum 4 choices allowed");
  }

  // Validate each choice structure and priorities
  const priorities = new Set();
  for (let i = 0; i < choices.length; i++) {
    const c = choices[i];
    if (!c.companyId || !c.domainId || !c.location || !c.priority) {
      throw new ApiError(400, `Choice ${i + 1} must have companyId, domainId, location, and priority`);
    }
    if (typeof c.priority !== "number" || c.priority < 1 || c.priority > 4) {
      throw new ApiError(400, "Priority must be between 1 and 4");
    }
    if (priorities.has(c.priority)) {
      throw new ApiError(400, "Duplicate priorities are not allowed");
    }
    priorities.add(c.priority);
  }

  const student = await Student.findOne({ user: userId });
  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  // 1. Verify all companies exist, are active, and OPEN, and match the domainId
  const companyIds = choices.map(c => c.companyId);
  const companies = await Company.find({ _id: { $in: companyIds }, recruitmentStatus: "OPEN" }).populate("domainTags");
  if (companies.length !== companyIds.length) {
    throw new ApiError(400, "One or more companies are invalid or not open for recruitment");
  }

  // 2. For each choice, check company-domain match and student preference
  const preferredDomains = (student.internshipData.preferredDomains || []).map(d => d.toString());
  const mismatched = [];
  for (let i = 0; i < choices.length; i++) {
    const { companyId, domainId } = choices[i];
    // Check company exists
    const company = companies.find(c => c._id.toString() === companyId);
    if (!company) {
      mismatched.push({ companyId, reason: "Company not found or not open" });
      continue;
    }
    // Check company has the domainId
    const companyDomains = (company.domainTags || []).map(d => d._id ? d._id.toString() : d.toString());
    if (!companyDomains.includes(domainId)) {
      mismatched.push({ companyId, reason: "Company does not offer this domain" });
    }
    // Check student preference
    if (!preferredDomains.includes(domainId)) {
      mismatched.push({ companyId, reason: "Domain not in student preferences" });
    }
  }
  if (mismatched.length > 0) {
    throw new ApiError(400, `Invalid choices: ${mismatched.map(m => `${m.companyId} (${m.reason})`).join(", ")}`);
  }

  // Save choices in the new structure, including domain (company, domain, location, priority)
  const files = req.files || {};
    const processedChoices = [];

    for (const choice of choices) {
      const priority = choice.priority;
      const fileKey = `resume_${priority}`; // e.g., resume_1
      let resumeUrl = "";

      // Check if file exists for this priority
      if (files[fileKey] && files[fileKey][0]) {
        const localFilePath = files[fileKey][0].path;
        const uploadResult = await uploadOnCloudinary(localFilePath);
        
        if (!uploadResult?.secure_url) {
          throw new ApiError(500, `Failed to upload resume for choice priority ${priority}`);
        }
        resumeUrl = uploadResult.secure_url;
      } else {
        throw new ApiError(400, `Resume file is mandatory for choice priority ${priority}`);
      }

      processedChoices.push({
        company: choice.companyId,
        domain: choice.domainId,
        location: choice.location,
        priority: choice.priority,
        resume: resumeUrl // The Cloudinary URL
      });
    }

    // 5. Update Student Data
    // Ensure we initialize objects if they don't exist
    student.internshipData = student.internshipData || {};
    student.internshipData.choices = processedChoices;

    student.internshipData.isFormSubmitted = true;
    student.internshipData.approvalStatus = "PENDING_REVIEW";
    student.internshipData.allocationStatus = "NOT_ALLOCATED";

    if (!Array.isArray(student.internshipData.approvalStatusHistory)) {
      student.internshipData.approvalStatusHistory = [];
    }

    student.internshipData.approvalStatusHistory.push({ status: "SUBMITTED", createdAt: new Date() });
    student.internshipData.approvalStatusHistory.push({ status: "PENDING_REVIEW", createdAt: null });

  await student.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, student, "Internship choices submitted successfully" )
    );
});

// Get Application Status
const getApplicationStatus = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId);

  if (!user || user.role !== "STUDENT") {
    throw new ApiError(403, "Not a student user");
  }

  const student = await Student.findOne({ user: userId })
    .populate("internshipData.choices.company", "name location domainTags")
    .populate("internshipData.allocatedCompany", "name location domainTags");

  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  const applicationStatus = {
    formSubmitted: student.internshipData.isFormSubmitted,
    approvalStatus: student.internshipData.approvalStatus,
    allocationStatus: student.internshipData.allocationStatus,
    choices: student.internshipData.choices,
    allocatedCompany: student.internshipData.allocatedCompany,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        applicationStatus,
        "Application status fetched successfully"
      )
    );
});

// Get all companies for a given domainId (with all conditions)
const getAllCompaniesWithDomains = asyncHandler(async (req, res) => {
  const { domainId } = req.params;
  if (!domainId) {
    throw new ApiError(400, "domainId is required in params");
  }
  // Validate domain exists and is active
  const domain = await Domain.findOne({ _id: domainId, isActive: true });
  if (!domain) {
    throw new ApiError(404, "Domain not found or inactive");
  }
  // Find all companies with this domain and recruitmentStatus OPEN
  const companies = await Company.find({
    recruitmentStatus: "OPEN",
    domainTags: domainId,
  })
    .populate("domainTags", "name description isActive")
    .sort({ name: 1 });

  return res.status(200).json(
    new ApiResponse(200, companies, "Companies for domain fetched successfully")
  );
});

// Generate Training Letter PDF from official template
const generateTrainingLetterPdf = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId;

  if (!studentId) {
    throw new ApiError(401, "Unauthorized");
  }

  const student = await Student.findById(studentId)
    .populate("user", "email role")
    .populate("branch", "name code programType")
    .populate("internshipData.allocatedCompany", "name location");

  if (!student) {
    throw new ApiError(404, "Student profile not found");
  }

  // Paths to official templates (PDF preferred)
  const templatePdfPath = path.join(
    process.cwd(),
    "public",
    "temp",
    "Training Letter.pdf"
  );

  if (!fs.existsSync(templatePdfPath)) {
    throw new ApiError(500, "Training letter template not found on server");
  }

  const existingPdfBytes = fs.readFileSync(templatePdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSize = 10;

  // Helper to draw normal text
  const drawText = (text, x, y) => {
    firstPage.drawText(text ?? "", {
      x,
      y,
      size: fontSize,
      font,
    });
  };
  // Map student fields to template fields
  const allocatedCompany = student.internshipData.allocatedCompany?.name || "";
  const branchName = student.branch?.name || "";
  const name = student.fullName || "";
  const courseYear = `${student.branch?.name || ""} / Year ${student.year || ""}`;
  const rollNo = student.rollNumber || "";
  const email = student.email || user.email || "";
  const contactNo = student.phoneNumber || "";

  // NOTE: X/Y coordinates must be aligned with the blanks
  // on your official Training Letter.pdf. Adjust these values
  // once by testing until text sits exactly in the right place.
  // Coordinates below are placeholders for A4 portrait.
  // Example positions (from left-bottom origin):
  // Allocated Name : ______________________ (bold)
  firstPage.drawText(allocatedCompany ?? "", {
    x: 100,
    y: height - 382,
    size: fontSize,
    font: boldFont,
  });

  // Branch Name : ______________________
    firstPage.drawText(branchName ?? "", {
    x: 146,
    y: height - 397,
    size: fontSize,
    font: boldFont,
  });
  // drawText(branchName, 186, height - 397);
  
  // Name of Student : ______________________
  drawText(name, 250, height - 431);

  // Course/Year : ______________________
  drawText(courseYear, 250, height - 443);

  // Roll.No. : ______________________
  drawText(rollNo, 250, height - 458);

  // Email : ______________________
  drawText(email, 250, height - 471);

  // Contact No. : ______________________
  drawText(contactNo, 250, height - 484);

  const pdfBytes = await pdfDoc.save();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=Training_Letter.pdf"
  );
  return res.status(200).send(Buffer.from(pdfBytes));
});

// Feature flags for students
const getFeatureSettingsPublic = asyncHandler(async (req, res) => {
  let settings = await FeatureSettings.findOne();
  if (!settings) {
    settings = await FeatureSettings.create({});
  }
  return res.status(200).json(
    new ApiResponse(200, {
      enableUpdateDomain: settings.enableUpdateDomain,
      enableApplyCompany: settings.enableApplyCompany,
      enableCompanyList: settings.enableCompanyList,
      enableMyApplication: settings.enableMyApplication,
    }, "Feature settings fetched")
  );
});


export {
  getStudentProfile,
  updateStudentProfile,
  updateSurveyPreferences,
  submitInternshipChoices,
  getApplicationStatus,
  updateStudentDomain,
  getAllCompaniesWithDomains,
  generateTrainingLetterPdf,
  getFeatureSettingsPublic,
};
