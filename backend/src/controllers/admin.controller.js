import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Student } from "../models/student.model.js";
import { User } from "../models/user.model.js";
import { Branch } from "../models/branch.model.js";
import { Domain } from "../models/domain.model.js";
import { Company } from "../models/company.model.js";
import { FeatureSettings } from "../models/featureSettings.model.js";
import xlsx from "xlsx";
import { Faculty } from "../models/faculty.model.js";
import mongoose from "mongoose";
import fs from "fs";

// Utility: Generate 6-digit temporary password
function generateTempPassword() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Utility: Clean Excel-like values ("--", "NULL", "0000-00-00")
function cleanValue(val) {
  if (val === undefined || val === null) return "";
  if (typeof val === "string" && ["--", "NULL", "null", "0000-00-00", ""].includes(val.trim())) return "";
  return val;
}

// Normalize Excel row keys by trimming whitespace
function normalizeRowKeys(row) {
  if (!row || typeof row !== "object") return row;
  const normalized = {};
  Object.keys(row).forEach((k) => {
    const nk = typeof k === "string" ? k.trim() : k;
    normalized[nk] = row[k];
  });
  return normalized;
}

// Register Single Student
const registerStudent = asyncHandler(async (req, res) => {
  const { email, fullName, rollNumber, registrationNumber, fatherName, dateOfBirth, phoneNumber, branchId, year, domainsId } = req.body;

  const userId = req.user?._id;
  let newUser = null;
  let newStudent = null;
  try {
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

    // ============ VALIDATION ============

    // Check required User fields
    if (!email || !fullName || !rollNumber || !registrationNumber || !fatherName || !dateOfBirth || !phoneNumber || !branchId || !year) {
      throw new ApiError( 400, "All fields are required");
    }

    // College email validation
    if (!email.endsWith("@jietjodhpur.ac.in")) {
      throw new ApiError(400, "Register with a valid college email");
    }

    // Phone number validation (10 digits)
    if(!/^\d{10}$/.test(phoneNumber)) {
      throw new ApiError(400, "Phone number must be 10 digits");
    }

    // Check if User already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    // Check if Student with same rollNumber already exists
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      throw new ApiError(409, "Student with this roll number already exists");
    }

    // Verify branch exists
    const branch = await Branch.findById(branchId);
    if (!branch) {
      throw new ApiError(404, "Branch not found");
    }
    console.log(domainsId);
    
    // Verify all domains exists
    const domainIdsArray = Array.isArray(domainsId) ? domainsId : (domainsId ? [domainsId] : []);
    for (const domainId of domainIdsArray) {
      const domain = await Domain.findById(domainId);
      if (!domain) {
        throw new ApiError(404, "One or more provided domain IDs are invalid");
      }
    }
    
    // Generate 6-digit temp password
    // NOTE: password is used for login (hashed), tempPassword is stored in plain text for reference (e.g., to show to user/admin)
    // Always use the value in tempPassword for login, as password is set to the same value and then hashed
    const password = generateTempPassword();

    // ============ CREATE USER ============
    newUser = await User.create({
      email,
      password,
      tempPassword: password,
      role: "STUDENT",
      fullName,
      provider: "LOCAL",
      isEmailVerified: false,
    });

    // ============ CREATE STUDENT PROFILE ============
    newStudent = await Student.create({
      user: newUser._id,
      fullName,
      rollNumber,
      registrationNumber: registrationNumber || "",
      fatherName: fatherName || "",
      dateOfBirth: cleanValue(dateOfBirth) || null,
      email,
      phoneNumber: phoneNumber || "",
      branch: branchId,
      year: year || "",
      internshipData: {
        preferredDomains: domainIdsArray,
      },
      isActive: true,
    });

    // ============ LINK USER TO STUDENT PROFILE ============
    newUser.profileId = newStudent._id;
    await newUser.save({ validateBeforeSave: false });

    return res.status(201).json( new ApiResponse( 201, {},"Student registered successfully" )
    );
  } catch (error) {
    // Rollback: delete created user and student if any error occurs
    if (newStudent && newStudent._id) {
      try { await Student.findByIdAndDelete(newStudent._id); } catch (cleanupErr) {}
    }
    if (newUser && newUser._id) {
      try { await User.findByIdAndDelete(newUser._id); } catch (cleanupErr) {}
    }
    throw error;
  }
});

// Register Faculty (Admin/TPO only)
const registerFaculty = asyncHandler(async (req, res) => {
  const { email, role, fullName, employeeId, branchId, phoneNumber, designation, dateOfBirth } = req.body;

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
  
  // Validate required fields
  if (!email || !role || !fullName || !branchId || !phoneNumber || !designation || !dateOfBirth) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // College email validation
  if (!email.endsWith("@jietjodhpur.ac.in")) {
    throw new ApiError(400, "Register with a valid college email");
  }

  // Phone number validation (10 digits)
  if(!/^\d{10}$/.test(phoneNumber)) {
    throw new ApiError(400, "Phone number must be 10 digits");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Check if faculty already exists
  const existingFaculty = await Faculty.findOne({ email });
  if (existingFaculty) {
    throw new ApiError(409, "Faculty with this email already exists");
  }

  // Check employeeId uniqueness
  if (employeeId) {
    const empIdExists = await Faculty.findOne({ employeeId });
    if (empIdExists) {
      throw new ApiError(409, "Faculty with this employee ID already exists");
    }
  }

  // Check branch existence or not
  const branch = await Branch.findById(branchId);
  
  if (!branch) {
    throw new ApiError(404, "Branch not found");
  }

  const password = generateTempPassword();

  // role must be Admin, TPO, Faculty only
  if (!["ADMIN", "TPO", "FACULTY"].includes(role)) {
    throw new ApiError(400, "Invalid role. Must be one of: ADMIN, TPO, FACULTY");
  }

  let newUser = null;
  let newFaculty = null;
  try {
    // Create new user
    newUser = await User.create({
      email,
      password,
      tempPassword: password,
      role,
      fullName: fullName || "",
      provider: "LOCAL",
    });

    // ============ CREATE FACULTY PROFILE ============
    newFaculty = await Faculty.create({
      user: newUser._id,
      email: email,
      fullName,
      dateOfBirth: cleanValue(dateOfBirth) || null,
      employeeId: employeeId || "",
      designation: designation || "",
      phoneNumber: phoneNumber || "",
      branch: branchId || "",
      isActive: true,
    });

    // ============ LINK USER TO FACULTY PROFILE ============
    newUser.profileId = newFaculty._id;
    await newUser.save({ validateBeforeSave: false });

    // ============ PREPARE RESPONSE ============
    const userResponse = await User.findById(newUser._id);
    const facultyResponse = await Faculty.findById(newFaculty._id).populate(
      "branch",
      "name code programType"
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          user: userResponse,
          faculty: facultyResponse,
        },
        "Faculty registered successfully"
      )
    );
  } catch (error) {
    // Rollback: delete created user and faculty if any error occurs
    if (newFaculty && newFaculty._id) {
      await Faculty.findByIdAndDelete(newFaculty._id);
    }
    if (newUser && newUser._id) {
      await User.findByIdAndDelete(newUser._id);
    }
    throw error;
  }
});

// Update Faculty (Admin/TPO only)
const updateFaculty = asyncHandler(async (req, res) => {
  const { facultyId } = req.params;
  const {
    email,
    role,
    fullName,
    employeeId,
    branchId,
    phoneNumber,
    designation,
    dateOfBirth,
    isActive,
  } = req.body;

  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.role !== "ADMIN" && user.role !== "TPO") {
    throw new ApiError(403, "Only admin and TPO can update faculty");
  }

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) {
    throw new ApiError(404, "Faculty not found");
  }

  const facultyUser = await User.findById(faculty.user);
  if (!facultyUser) {
    throw new ApiError(404, "Linked user not found");
  }

  if (email && email !== faculty.email) {
    if (!email.endsWith("@jietjodhpur.ac.in")) {
      throw new ApiError(400, "Register with a valid college email");
    }
    const existingUser = await User.findOne({ email, _id: { $ne: facultyUser._id } });
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }
    const existingFaculty = await Faculty.findOne({ email, _id: { $ne: faculty._id } });
    if (existingFaculty) {
      throw new ApiError(409, "Faculty with this email already exists");
    }
    faculty.email = email;
    facultyUser.email = email;
  }

  if (employeeId && employeeId !== faculty.employeeId) {
    const empIdExists = await Faculty.findOne({ employeeId, _id: { $ne: faculty._id } });
    if (empIdExists) {
      throw new ApiError(409, "Faculty with this employee ID already exists");
    }
    faculty.employeeId = employeeId;
  }

  if (role) {
    if (!["ADMIN", "TPO", "FACULTY"].includes(role)) {
      throw new ApiError(400, "Invalid role. Must be one of: ADMIN, TPO, FACULTY");
    }
    facultyUser.role = role;
  }

  if (fullName) {
    faculty.fullName = fullName;
    facultyUser.fullName = fullName;
  }

  if (branchId) {
    const branch = await Branch.findById(branchId);
    if (!branch) {
      throw new ApiError(404, "Branch not found");
    }
    faculty.branch = branchId;
  }

  if (phoneNumber !== undefined) faculty.phoneNumber = phoneNumber;
  if (designation) faculty.designation = designation;
  if (dateOfBirth) faculty.dateOfBirth = cleanValue(dateOfBirth) || null;
  if (isActive !== undefined) faculty.isActive = isActive;

  await faculty.save();
  await facultyUser.save({ validateBeforeSave: false });

  const facultyResponse = await Faculty.findById(faculty._id)
    .populate("branch", "name code programType")
    .populate({
      path: "user",
      select: "email +tempPassword role",
    });

  const facultyObj = facultyResponse.toObject();
  facultyObj.role = facultyObj.user && facultyObj.user.role ? facultyObj.user.role : undefined;

  return res
    .status(200)
    .json(
      new ApiResponse(200, facultyObj, "Faculty updated successfully")
    );
});

// Delete Faculty (Admin/TPO only)
const deleteFaculty = asyncHandler(async (req, res) => {
  const { facultyId } = req.params;

  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.role !== "ADMIN" && user.role !== "TPO") {
    throw new ApiError(403, "Only admin and TPO can delete faculty");
  }

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) {
    throw new ApiError(404, "Faculty not found");
  }

  const facultyUserId = faculty.user;

  await faculty.deleteOne();
  if (facultyUserId) {
    await User.findByIdAndDelete(facultyUserId);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { _id: facultyId }, "Faculty deleted successfully")
    );
});

// Get All Students (For TPO Dashboard)
const getAllStudents = asyncHandler(async (req, res) => {
  const { branch, allocationStatus, isFormSubmitted } = req.query;

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

  const filter = {};

  if (branch) {
    filter.branch = branch;
  }

  if (allocationStatus) {
    filter["internshipData.allocationStatus"] = allocationStatus;
  }

  if (isFormSubmitted !== undefined) {
    filter["internshipData.isFormSubmitted"] = isFormSubmitted === "true";
  }

  const students = await Student.find(filter)
    .populate("branch", "name code programType")
    .populate({
      path: "user",
      select: "email +tempPassword",
    })
    .populate("internshipData.allocatedCompany", "name")
    .sort({ fullName: 1 });

  if (!students || students.length === 0) {
    throw new ApiError(404, "No students found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, students, "Students fetched successfully")
    );
});

const getAllFaculties = asyncHandler(async (req, res) => {
  
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

  const faculties = await Faculty.find()
    .populate("branch", "name code programType")
    .populate({
      path: "user",
      select: "email +tempPassword role",
    })
    .sort({ fullName: 1 });

  if (!faculties || faculties.length === 0) {
    throw new ApiError(404, "No faculties found");
  }

  // Map to include role in the top-level faculty object for easier frontend consumption
  const facultiesWithRole = faculties.map(faculty => {
    const facultyObj = faculty.toObject();
    facultyObj.role = facultyObj.user && facultyObj.user.role ? facultyObj.user.role : undefined;
    return facultyObj;
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, facultiesWithRole, "Faculties fetched successfully")
    );
});

const getAllStudentsApplications = asyncHandler(async (req, res) => {

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

  // Allow applications where isFormSubmitted is true OR approvalStatus is REJECTED
  let students = await Student.find({
    $or: [
      { "internshipData.isFormSubmitted": true },
      { "internshipData.approvalStatus": "REJECTED" }
    ]
  })
    .populate("branch", "name code programType")
    .populate("user", "email")
    .populate("internshipData.allocatedCompany", "name")
    .populate("internshipData.preferredDomains", "name description")
    .populate({
      path: "internshipData.choices.company",
      select: "name"
    })
    .populate({
      path: "internshipData.choices.domain",
      select: "name description"
    });

  // Sort: PENDING_REVIEW first, then by createdAt (oldest first)
  students = students.sort((a, b) => {
    const aPending = a.internshipData && a.internshipData.approvalStatus === 'PENDING_REVIEW';
    const bPending = b.internshipData && b.internshipData.approvalStatus === 'PENDING_REVIEW';
    if (aPending && !bPending) return -1;
    if (!aPending && bPending) return 1;
    // Both same status: sort by createdAt (oldest first)
    const aDate = a.createdAt || 0;
    const bDate = b.createdAt || 0;
    return aDate - bDate;
  });

  if (!students || students.length === 0) {
    throw new ApiError(404, "No students found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, students, "Students fetched successfully")
    );
});

// Get Students Details
const getStudentDetails = asyncHandler(async (req, res) => {
  
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

  const email = req.params.email;

  if (!email) {
    throw new ApiError(400, "Email not provided");
  }

  // Find student by email (student.email field)
  const studentData = await Student.findOne({ email })
    .populate({
      path: "user",
      select: "email role fullName firstName lastName profileImage isActive isEmailVerified",
    })
    .populate("branch", "name code programType specializations")
    .populate("internshipData.preferredDomains", "name description")
    .populate("internshipData.allocatedCompany", "name")
    .populate("internshipData.choices.company", "name")
    .populate("internshipData.choices.domain", "name description");

  if (!studentData) {
    throw new ApiError(404, "Student not found");
  }

  return res.status(200).json(
    new ApiResponse(200, studentData, "Student details fetched successfully")
  );
});

// Delete Student (Admin/TPO only)
const deleteStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.role !== "ADMIN" && user.role !== "TPO") {
    throw new ApiError(403, "Only admin and TPO can delete students");
  }

  const student = await Student.findById(studentId);
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const allocatedCompanyId =
    student.internshipData && student.internshipData.allocatedCompany
      ? student.internshipData.allocatedCompany
      : null;

  if (allocatedCompanyId) {
    const company = await Company.findById(allocatedCompanyId);
    if (company) {
      company.filledSeats = Math.max(0, (company.filledSeats || 0) - 1);
      await company.save();
    }
  }

  const studentUserId = student.user;
  await student.deleteOne();
  if (studentUserId) {
    await User.findByIdAndDelete(studentUserId);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { _id: studentId }, "Student deleted successfully")
    );
});

// Update Student Details (Admin: update all fields of user and student by email)
const updateStudentProfile = asyncHandler(async (req, res) => {
  const {
    email, // required
    fullName,
    fatherName,
    dateOfBirth,
    phoneNumber,
    rollNumber,
    registrationNumber,
    branchId,
    year,
  } = req.body;

  // Extract password and isFormSubmitted separately
  const password = req.body.password;
  const isFormSubmitted = req.body.isFormSubmitted;

  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const userD = await User.findById(userId);

  if (!userD) {
    throw new ApiError(404, "User not found");
  }
  if (userD.role !== "ADMIN" && userD.role !== "TPO") {
    throw new ApiError(403, "Only admin and TPO can register students");
  }

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // Find user and student by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const student = await Student.findOne({ email });
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  // If branchId is provided, verify branch exists before updating
  if (branchId) {
    const branchExists = await Branch.findById(branchId);
    if (!branchExists) {
      throw new ApiError(404, "Branch not found");
    }
    student.branch = branchId;
  }

  // Update User fields
  if (typeof fullName === "string") user.fullName = fullName;
  if (typeof password === "string" && password.length > 0) {
    user.password = password;
  }

  await user.save();

  // Update Student fields
  if (typeof fullName === "string") student.fullName = fullName;
  if (typeof fatherName === "string") student.fatherName = fatherName;
  if (typeof dateOfBirth === "string") student.dateOfBirth = dateOfBirth;
  if (typeof gender === "string") student.gender = gender;
  if (typeof category === "string") student.category = category;
  if (typeof phoneNumber === "string") student.phoneNumber = phoneNumber;
  if (typeof rollNumber === "string") student.rollNumber = rollNumber;
  if (typeof registrationNumber === "string") student.registrationNumber = registrationNumber;
  // branch is now only set above if branchId is provided and valid
  if (typeof year === "string") student.year = year;

  // Update isFormSubmitted in internshipData only if present
  if (typeof isFormSubmitted === "boolean") {
    student.internshipData = student.internshipData || {};
    student.internshipData.isFormSubmitted = isFormSubmitted;
  }

  await student.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Student profile updated successfully")
  );
});

// Reset all Student Applications (Admin only)
const choiceResetAllStudentApplications = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.role !== "ADMIN") {
    throw new ApiError(403, "Only admin can reset student applications");
  }

  // Reset internshipData for all students (preserve preferredDomains)
  await Student.updateMany(
    {},
    {
      $set: {
        "internshipData.choices": [],
        "internshipData.isFormSubmitted": false,
        "internshipData.allocationStatus": null,
        "internshipData.approvalStatus": null,
        "internshipData.allocatedCompany": null,
        "internshipData.approvalStatusHistory": [],
      }
    }
  );

  // Reset filledSeats for all companies
  await Company.updateMany({}, { $set: { filledSeats: 0 } });

  return res.status(200).json(
    new ApiResponse(200, {}, "All student applications have been reset")
  );
});

// Reset all Student Applications (Admin only)
const fullResetAllStudentApplications = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.role !== "ADMIN") {
    throw new ApiError(403, "Only admin can reset student applications");
  }

  // Reset internshipData for all students
  await Student.updateMany(
    {},
    {
      $set: {
        "internshipData": {
          preferredDomains: [],
          choices: [],
          isFormSubmitted: false,
          allocationStatus: null,
          approvalStatus: null,
          allocatedCompany: null,
          approvalStatusHistory: [],
        }
      }
    }
  );

  // Reset filledSeats for all companies
  await Company.updateMany({}, { $set: { filledSeats: 0 } });

  return res.status(200).json(
    new ApiResponse(200, {}, "All student applications have been reset")
  );
});

  // Allocate Company to Student 
const allocateCompanyToStudent = asyncHandler(async (req, res) => {
  // Accept either studentId or studentEmail
  const { studentId, companyId } = req.body;

  if (!studentId) {
    throw new ApiError(400, "studentId is required");
  }
  if (!companyId) {
    throw new ApiError(400, "companyId is required");
  }

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

  const student = await Student.findById(studentId);

  // Already allocated?
  if (student.internshipData && student.internshipData.allocatedCompany) {
    throw new ApiError(400, `Student already allocated to a company: ${student.internshipData.allocatedCompany}`);
  }

  // Check company choices exist and sheet is not empty
  
  // Get choices (should be array of up to 4)
  const choices = (student.internshipData && Array.isArray(student.internshipData.choices)) ? student.internshipData.choices : [];
  if (!choices.length) {
    throw new ApiError(400, "No choices found for student");
  }

  // Ensure companyId is among student's choices
  const selectedChoice = choices.find(
    (choice) => choice.company && choice.company.toString() === companyId.toString()
  );
  if (!selectedChoice) {
    throw new ApiError(400, "Selected company is not in student's choices");
  }

  const company = await Company.findById(companyId);
  if (!company || company.recruitmentStatus !== "OPEN") {
    throw new ApiError(404, "Company not found or not open for recruitment");
  }

  if (company.filledSeats >= company.totalSeats) {
    throw new ApiError(400, "No seats available in selected company");
  }

  // Allocate selected company
  student.internshipData = student.internshipData || {};
  student.internshipData.allocatedCompany = company._id;
  student.internshipData.allocationStatus = "ALLOCATED";
  student.internshipData.approvalStatus = "ALLOCATED";
  if (!Array.isArray(student.internshipData.approvalStatusHistory)) {
    student.internshipData.approvalStatusHistory = [];
  }
  student.internshipData.approvalStatusHistory.push({ status: "APPROVED_BY_TPO", createdAt: new Date() });
  student.internshipData.approvalStatusHistory.push({ status: "ALLOCATED", createdAt: null });
  await student.save();

  company.filledSeats += 1;
  await company.save();

  return res.status(200).json(
    new ApiResponse(200, { allocatedCompany: company }, "Company allocated successfully")
  );
});

// Reject Student Application
const rejectStudentApplication = asyncHandler(async (req, res) => {
  const { studentId, reason } = req.body;

  if (!studentId) {
    throw new ApiError(400, "studentId is required");
  }

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

  const student = await Student.findById(studentId);

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  // Update internshipData
  student.internshipData = student.internshipData || {};
  student.internshipData.allocationStatus = "REJECTED";
  student.internshipData.approvalStatus = "REJECTED";
  student.internshipData.rejectionReason = reason || "No reason provided";
  student.internshipData.isFormSubmitted = false;
  // remove company choices
  student.internshipData.choices = [];

  // Update timeline history: REJECTED (with date)
  if (!Array.isArray(student.internshipData.approvalStatusHistory)) {
    student.internshipData.approvalStatusHistory = [];
  }

  student.internshipData.approvalStatusHistory.push({ status: "REJECTED_BY_TPO", createdAt: new Date() });
  student.internshipData.approvalStatusHistory.push({ status: "REJECTED", createdAt: null });

  await student.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Student application rejected successfully")
  );
});

// Update Student Allocated Company (Admin/TPO)
const updateStudentAllocatedCompany = asyncHandler(async (req, res) => {
  const { studentId, companyId } = req.body;

  if (!studentId || !companyId) {
    throw new ApiError(400, "studentId and companyId are required");
  }

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

  const student = await Student.findById(studentId);
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  const company = await Company.findById(companyId);
  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  // Only allow update if student already has an allocated company
  student.internshipData = student.internshipData || {};
  const oldCompanyId = student.internshipData.allocatedCompany;
  if (!oldCompanyId) {
    throw new ApiError(400, "Student does not have an allocated company to update from");
  }

  // Check if new company has available seats
  if (company.filledSeats >= company.totalSeats) {
    throw new ApiError(400, "No available seats in the new company");
  }

  // Update student's allocated company
  student.internshipData.allocatedCompany = company._id;
  await student.save();

  // Increment filledSeats in new company
  company.filledSeats += 1;
  await company.save();

  // Decrement filledSeats in old company (if different)
  if (oldCompanyId.toString() !== company._id.toString()) {
    const oldCompany = await Company.findById(oldCompanyId);
    if (oldCompany && oldCompany.filledSeats > 0) {
      oldCompany.filledSeats -= 1;
      await oldCompany.save();
    }
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Student allocated company updated successfully")
  );
});

// Download Student Temporary password Excel
const downloadStudentTempPassword = asyncHandler(async (req, res) => {
  // Aggregate students with user info, sort by registrationNumber
  const students = await Student.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userInfo"
      }
    },
    { $unwind: "$userInfo" },
    {
      $lookup: {
        from: "branches",
        localField: "branch",
        foreignField: "_id",
        as: "branchInfo"
      }
    },
    { $unwind: "$branchInfo" },
    { $sort: { registrationNumber: 1 } }
  ]);

  if (!students || students.length === 0) {
    throw new ApiError(404, "No students found");
  }

  // Prepare data for Excel
  const data = students.map(student => ({
    "Name": student.fullName,
    "Registration Number": student.registrationNumber || "",
    "Roll Number": student.rollNumber || "",
    "Branch": student.branchInfo.name || "",
    "Year": student.year || "",
    "phoneNumber": student.phoneNumber || "",
    "Email": student.email || "",
    "Temporary Password": student.userInfo.tempPassword || "N/A"
  }));

  // Create worksheet and workbook
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Students");

  // Write to buffer
  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

  // Set headers and send file
  res.setHeader("Content-Disposition", "attachment; filename=student_temp_passwords.xlsx");
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  return res.status(200).send(buffer);
});

// Download Student Applications Company wise
const downloadCompanyStudents = asyncHandler(async (req, res) => {
  const { companyId, type } = req.body;

  if (!companyId) {
    throw new ApiError(400, "companyId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    throw new ApiError(400, "Invalid companyId");
  }

  const company = await Company.findById(companyId).select("name");
  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  const normalizedType = (type || "all").toString().toLowerCase().replace(/\s+/g, "_");
  const baseQuery = { "internshipData.choices.company": companyId };
  const query =
    normalizedType === "alloted" || normalizedType === "allocated"
      ? { ...baseQuery, "internshipData.allocatedCompany": companyId }
      : normalizedType === "not_alloted" || normalizedType === "not_allocated"
        ? { ...baseQuery, "internshipData.allocatedCompany": { $ne: companyId } }
        : baseQuery;

  const students = await Student.find(query)
    .populate("branch", "name")
    .populate("internshipData.choices.company", "name")
    .populate("internshipData.choices.domain", "name");

  if (!students || students.length === 0) {
    throw new ApiError(404, "No students found for this company");
  }

  const data = students.map((student) => {
    const matchedChoice = student?.internshipData?.choices?.find(
      (choice) => choice?.company?._id?.toString() === companyId.toString()
    );

    return {
      "Name": student.fullName || "",
      "Registration Number": student.registrationNumber || "",
      "Roll Number": student.rollNumber || "",
      "Branch": student.branch?.name || "",
      "Year": student.year || "",
      "Phone Number": student.phoneNumber || "",
      "Email": student.email || "",
      "Allocated Company": company.name || "",
      "Choice Priority": matchedChoice?.priority ?? "",
      "Choice Location": matchedChoice?.location || "",
      "Choice Domain": matchedChoice?.domain?.name || "",
      "Choice Resume": matchedChoice?.resume || "",
      "Approval Status": student?.internshipData?.approvalStatus || "",
      "Allocation Status": student?.internshipData?.allocationStatus || ""
    };
  });

  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Students");

  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

  const safeCompanyName = (company.name || "company")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${safeCompanyName || "company"}_allocated_students.xlsx`
  );
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  return res.status(200).send(buffer);
});

// Download all allotted or unallotted students across all companies (only those who filled choices)
const downloadAllCompanyStudents = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const normalizedType = (type || "alloted").toString().toLowerCase().replace(/\s+/g, "_");
  const isAllotted = normalizedType === "alloted" || normalizedType === "allocated";
  const baseQuery = { "internshipData.choices.0": { $exists: true } };
  const query = isAllotted
    ? { ...baseQuery, "internshipData.allocationStatus": "ALLOCATED" }
    : { ...baseQuery, "internshipData.allocationStatus": { $ne: "ALLOCATED" } };

  const students = await Student.find(query)
    .populate("branch", "name")
    .populate("internshipData.allocatedCompany", "name")
    .populate("internshipData.choices.company", "name")
    .populate("internshipData.choices.domain", "name");

  if (!students || students.length === 0) {
    throw new ApiError(404, "No students found");
  }

  const data = students.map((student) => {
    const chosenCompanies = Array.isArray(student?.internshipData?.choices)
      ? student.internshipData.choices
          .map((c) => c?.company?.name || "")
          .filter(Boolean)
          .join(", ")
      : "";

    return {
      "Name": student.fullName || "",
      "Registration Number": student.registrationNumber || "",
      "Roll Number": student.rollNumber || "",
      "Branch": student.branch?.name || "",
      "Year": student.year || "",
      "Phone Number": student.phoneNumber || "",
      "Email": student.email || "",
      "Allocated Company": isAllotted ? (student?.internshipData?.allocatedCompany?.name || "") : "",
      "Chosen Companies": chosenCompanies,
      "Approval Status": student?.internshipData?.approvalStatus || "",
      "Allocation Status": student?.internshipData?.allocationStatus || ""
    };
  });

  const workbook = xlsx.utils.book_new();
  const sheet = xlsx.utils.json_to_sheet(data);
  xlsx.utils.book_append_sheet(workbook, sheet, isAllotted ? "Allotted" : "Unallotted");

  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=all_company_${isAllotted ? "alloted" : "unalloted"}_students.xlsx`
  );
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  return res.status(200).send(buffer);
});

// Feature flags: get/update (Admin/TPO)
const getFeatureSettings = asyncHandler(async (req, res) => {
  const role = req.user?.role;
  if (role !== "ADMIN" && role !== "TPO" && role !== "FACULTY") {
    throw new ApiError(403, "Only admin or TPO can access feature settings");
  }
  let settings = await FeatureSettings.findOne();
  if (!settings) {
    settings = await FeatureSettings.create({});
  }
  return res.status(200).json(new ApiResponse(200, settings, "Feature settings fetched"));
});

const updateFeatureSettings = asyncHandler(async (req, res) => {
  const role = req.user?.role;
  if (role !== "ADMIN" && role !== "TPO" && role !== "FACULTY") {
    throw new ApiError(403, "Only admin or TPO can update feature settings");
  }
  const { enableUpdateDomain, enableApplyCompany, enableCompanyList, enableMyApplication } = req.body;
  let settings = await FeatureSettings.findOne();
  if (!settings) {
    settings = await FeatureSettings.create({});
  }
  if (typeof enableUpdateDomain === "boolean") settings.enableUpdateDomain = enableUpdateDomain;
  if (typeof enableApplyCompany === "boolean") settings.enableApplyCompany = enableApplyCompany;
  if (typeof enableCompanyList === "boolean") settings.enableCompanyList = enableCompanyList;
  if (typeof enableMyApplication === "boolean") settings.enableMyApplication = enableMyApplication;
  await settings.save();
  return res.status(200).json(new ApiResponse(200, settings, "Feature settings updated"));
});


// Bulk Student registration from table (Excel upload)
const bulkRegisterStudentsFromTable = asyncHandler(async (req, res) => {
  // If file is uploaded, parse Excel file
  let students = [];
  let uploadedFilePath = null;
  if (req.files && req.files.length > 0) {
    const file = req.files[0];
    uploadedFilePath = file.path;
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    students = xlsx.utils.sheet_to_json(worksheet);
  } else if (req.body.students) {
    // Fallback: if students array is sent as JSON
    students = req.body.students;
    if (typeof students === "string") {
      try {
        students = JSON.parse(students);
      } catch (e) {
        throw new ApiError(400, "Invalid students JSON");
      }
    }
  }

  if (!Array.isArray(students) || students.length === 0) {
    throw new ApiError(400, "No student data provided");
  }

  const results = [];
  for (let i = 0; i < students.length; i++) {
    const row = normalizeRowKeys(students[i]);

    let newUser = null;
    let newStudent = null;
    try {
      // Map Excel fields to model fields
      const fullName = cleanValue(row.stu_name);
      const rollNumber = cleanValue(row.stu_no) || cleanValue(row["Roll No."]);
      const registrationNumber = cleanValue(row.reg_no);
      const fatherName = cleanValue(row.father_name);
      // Fix: dateOfBirth should come from row.dob and be parsed as Date if valid
      let dateOfBirth = cleanValue(row.dob);
      if (dateOfBirth) {
        // Try to parse as date (Excel may give as string or number)
        if (!isNaN(Number(dateOfBirth))) {
          // Excel date as number (days since 1899-12-31)
          dateOfBirth = xlsx.SSF ? xlsx.SSF.parse_date_code(Number(dateOfBirth)) : null;
          if (dateOfBirth) {
            // Convert to JS Date
            dateOfBirth = new Date(dateOfBirth.y, dateOfBirth.m - 1, dateOfBirth.d);
          } else {
            dateOfBirth = null;
          }
        } else {
          // Try to parse as string
          const parsed = new Date(dateOfBirth);
          dateOfBirth = isNaN(parsed.getTime()) ? null : parsed;
        }
        // Remove time part, keep only date (YYYY-MM-DD)
        if (dateOfBirth instanceof Date && !isNaN(dateOfBirth.getTime())) {
          // Set time to 00:00:00 UTC and store as string YYYY-MM-DD
          const yyyy = dateOfBirth.getUTCFullYear();
          const mm = String(dateOfBirth.getUTCMonth() + 1).padStart(2, '0');
          const dd = String(dateOfBirth.getUTCDate()).padStart(2, '0');
          dateOfBirth = `${yyyy}-${mm}-${dd}`;
        }
      } else {
        dateOfBirth = null;
      }
      let email = cleanValue(row.stu_mailid);
      if (typeof email === "string") {
        email = email.replace(/\s+/g, "").trim();
      }
      // Fix: phoneNumber should come from row.stuot_mobilephone or row["stuot_mobilephone"], and trim extra spaces
      let phoneNumber = cleanValue(row.stuot_mobilephone) || "";
      if (typeof phoneNumber === "string") {
        phoneNumber = phoneNumber.replace(/\s+/g, "").trim();
      }
      const branchId = cleanValue(row.branch_id); // external branch id from excel
      const collegeId = cleanValue(row.colg); // external college id from excel
      const year = parseInt(cleanValue(row.studentYr)); // year from excel

      if (Number.isNaN(year)) {
        results.push({ row: i + 1, status: "error", error: "Invalid year" });
        continue;
      }
      // Generate 6-digit temp password
      // NOTE: password is used for login (hashed), tempPassword is stored in plain text for reference (e.g., to show to user/admin)
      const password = generateTempPassword();

      // Check if User already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        results.push({ row: i + 1, email, status: "skipped", reason: "User with this email already exists" });
        continue;
      }
      // Check if Student with same rollNumber already exists
      const existingStudent = await Student.findOne({ rollNumber });
      if (existingStudent) {
        results.push({ row: i + 1, rollNumber, status: "skipped", reason: "Student with this roll number already exists" });
        continue;
      }
      // Find branch by external mapping
      const branch = await Branch.findOne({
        externalMappings: {
          $elemMatch: {
            branchId: branchId,
            collegeId: collegeId,
            year: year
          }
        }
      });

      if (!branch) {
        results.push({ row: i + 1, branchId, collegeId, year, status: "error", error: "Branch not found for mapping" });
        continue;
      }

      // Create User
      newUser = await User.create({
        email,
        password,
        tempPassword: password,
        role: "STUDENT",
        firstName: fullName.split(" ")[0] || "",
        lastName: fullName.split(" ").slice(1).join(" ") || "",
        fullName,
        provider: "LOCAL",
        isEmailVerified: false,
      });

      // Create Student
      newStudent = await Student.create({
        user: newUser._id,
        fullName,
        rollNumber,
        registrationNumber: registrationNumber || "",
        fatherName: fatherName || "",
        dateOfBirth: dateOfBirth || null,
        email,
        phoneNumber: phoneNumber || "",
        branch: branch._id,
        isActive: true,
        year,
      });

      // Link User to Student
      newUser.profileId = newStudent._id;
      await newUser.save({ validateBeforeSave: false });

      results.push({ row: i + 1, email, rollNumber, status: "created", tempPassword: password });
    } catch (err) {
      // Try to include email if available in row
      let errorEmail = cleanValue(row.stu_mailid) || cleanValue(row.email) || null;

      // Cleanup: If user or student was created, remove them
      if (newStudent && newStudent._id) {
        try {
          await Student.findByIdAndDelete(newStudent._id);
        } catch (cleanupErr) {
          // Optionally log cleanup error
        }
      }
      if (newUser && newUser._id) {
        try {
          await User.findByIdAndDelete(newUser._id);
        } catch (cleanupErr) {
          // Optionally log cleanup error
        }
      }

      results.push({ row: i + 1, email: errorEmail, status: "error", error: err.message });
    }
  }

  // Only return failed/skipped students (status: "error" or "skipped")
  const failed = results.filter(r => r.status === "error" || r.status === "skipped");
  if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
    try { fs.unlinkSync(uploadedFilePath); } catch (e) {}
  }
  if (failed.length > 0) {
    const worksheet = xlsx.utils.json_to_sheet(failed);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Errors");
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", "attachment; filename=bulk_register_errors.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.status(200).send(buffer);
  }
  return res.status(201).json(
    new ApiResponse(201, [], "Bulk student registration completed successfully")
  );
});


// Bulk Domain Registration from table (Excel upload)
const bulkDomainRegistrationFromTable = asyncHandler(async (req, res) => {
  let students = [];
  if (req.files && req.files.length > 0) {
    const file = req.files[0];
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    students = xlsx.utils.sheet_to_json(worksheet);
  } else if (req.body.students) {
    students = req.body.students;
    if (typeof students === "string") {
      try {
        students = JSON.parse(students);
      } catch (e) {
        throw new ApiError(400, "Invalid students JSON");
      }
    }
  }

  if (!Array.isArray(students) || students.length === 0) {
    throw new ApiError(400, "No student data provided");
  }

  const failed = [];
  const userNotFound = [];
  const alreadyRegistered = [];
  for (let i = 0; i < students.length; i++) {
    const row = students[i];
    // Extract fields
    const email = (row["Official College Email ID"] || row["email"] || "").toLowerCase().trim();
    const branchName = (row["Branch"] || "").trim();
    const participateRaw = (row["Would you like to participate in Campus Placement Drive?"] || "").trim().toLowerCase();
    const altCareer = (row["If not interested in campus placement, which career path are you considering?"] || "").trim();
    const domainRaw = row["DOMAIN"] || row["Domain"] || "";
    const salary = row["Salary"] || "";

    // 1. Check User exists
    const user = await User.findOne({ email });
    if (!user) {
      userNotFound.push({ row: i + 1, email, branch: branchName, reason: "User not found", status: "error" });
      continue;
    }
    // 2. Check Student exists
    const student = await Student.findOne({ email });
    if (!student) {
      failed.push({ row: i + 1, email, branch: branchName, reason: "Student not found", status: "error" });
      continue;
    }
    // 3. Check Branch exists and matches (case-insensitive, trimmed)
    const branch = await Branch.findOne({ _id: student.branch });
    if (!branch || branch.name.trim().toLowerCase() !== branchName.trim().toLowerCase()) {
      // Try fallback: match ignoring specializations (if present)
      const allBranches = await Branch.find({});
      const altBranch = allBranches.find(b => b.name.trim().toLowerCase() === branchName.trim().toLowerCase());
      if (altBranch) {
        // Use altBranch for domain matching
        student.branch = altBranch._id;
      } else {
        failed.push({ row: i + 1, email, branch: branchName, reason: "Branch mismatch or not found", status: "error" });
        continue;
      }
    }
    // 4. Parse and check all domains exist by name only (no branch check)
    let domainNames = [];
    if (typeof domainRaw === "string") {
      // Only split on newlines and carriage returns, NOT commas
      domainNames = domainRaw.split(/\n|\r/).map(d => d.trim()).filter(Boolean);
    } else if (Array.isArray(domainRaw)) {
      domainNames = domainRaw.map(d => (typeof d === "string" ? d.trim() : "")).filter(Boolean);
    }
    // Check all domains exist by name only (robust match: ignore case, trim, normalize spaces and parentheses)
    function normalizeDomainName(str) {
      return (str || "")
        .replace(/\s+/g, " ") // collapse multiple spaces
        .replace(/\s*\(/g, " (") // ensure space before (
        .replace(/\)\s*/g, ")") // remove space after )
        .trim()
        .toLowerCase();
    }

    // Levenshtein distance for fuzzy matching
    function levenshtein(a, b) {
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;
      const matrix = [];
      for (let i = 0; i <= b.length; i++) matrix[i] = [i];
      for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1, // substitution
              matrix[i][j - 1] + 1,     // insertion
              matrix[i - 1][j] + 1      // deletion
            );
          }
        }
      }
      return matrix[b.length][a.length];
    }

    const allDomains = await Domain.find({});
    const foundDomains = [];
    const missingDomains = [];
    for (const dName of domainNames) {
      const normInput = normalizeDomainName(dName);
      const match = allDomains.find(d => normalizeDomainName(d.name) === normInput);
      if (!match) {
        // Fuzzy match: find closest DB domain name
        let closest = null;
        let minDist = Infinity;
        for (const d of allDomains) {
          const dist = levenshtein(normInput, normalizeDomainName(d.name));
          if (dist < minDist) {
            minDist = dist;
            closest = d.name;
          }
        }
        missingDomains.push(`${dName}${closest && minDist <= 5 ? ` (Did you mean: ${closest}?)` : ""}`);
      } else {
        foundDomains.push(match._id);
      }
    }
    if (missingDomains.length > 0) {
      failed.push({ row: i + 1, email, branch: branchName, reason: `Domains not found: ${missingDomains.join(", ")}`, status: "error" });
      continue;
    }

    // 5. Check if domains already registered
    const currentDomains = (student.internshipData && Array.isArray(student.internshipData.preferredDomains))
      ? student.internshipData.preferredDomains.map(id => id.toString())
      : [];
    const newDomains = foundDomains.map(id => id.toString());
    const alreadyMatch = currentDomains.length === newDomains.length && currentDomains.every(id => newDomains.includes(id));
    if (alreadyMatch) {
      alreadyRegistered.push({ row: i + 1, email, branch: branchName, domains: domainNames, status: "already_registered" });
      continue;
    }
    // Update student internshipData
    try {
      student.internshipData = student.internshipData || {};
      // isParticipating
      if (participateRaw === "yes") {
        student.internshipData.isParticipating = true;
        student.internshipData.alternativeCareerPath = "";
      } else {
        student.internshipData.isParticipating = false;
        student.internshipData.alternativeCareerPath = altCareer;
      }
      // Domains
      student.internshipData.preferredDomains = foundDomains;
      // Salary
      if (salary) student.internshipData.expectedSalary = salary;
      await student.save();
    } catch (err) {
      failed.push({ row: i + 1, email, branch: branchName, reason: err.message, status: "error" });
    }
  }
  return res.status(200).json(
    new ApiResponse(200, {
      userNotFound,
      failed,
      alreadyRegistered
    }, "Bulk domain registration: failed/skipped students only")
  );
});

const getTestStudentProfile = asyncHandler(async (req, res) => {
  const {email} = req.body;

  if (!email) {
    throw new ApiError(401, "email not provided");
  }

  const user = await User.findOne({ email: email });

  if (!user || user.role !== "STUDENT") {
    throw new ApiError(403, "Not a student user");
  }

  const student = await Student.findOne({ user: user._id })
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

// // Allocate Company to Student by Choice Priority
// const allocateCompanyToStudent = asyncHandler(async (req, res) => {
//   // Accept either studentId or studentEmail
//   const { studentId, companyId } = req.body;

//   if (!studentId) {
//     throw new ApiError(400, "studentId is required");
//   }

//   const userId = req.user?._id;

//   if (!userId) {
//     throw new ApiError(401, "Unauthorized");
//   }

//   const user = await User.findById(userId);

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }
//   if (user.role !== "ADMIN" && user.role !== "TPO") {
//     throw new ApiError(403, "Only admin and TPO can register students");
//   }

//   const student = await Student.findById(studentId);

//   // Already allocated?
//   if (student.internshipData && student.internshipData.allocatedCompany) {
//     throw new ApiError(400, `Student already allocated to a company: ${student.internshipData.allocatedCompany}`);
//   }

//   // Check company choices exist and sheet is not empty
  
//   // Get choices (should be array of up to 4)
//   const choices = (student.internshipData && Array.isArray(student.internshipData.choices)) ? student.internshipData.choices : [];
//   if (!choices.length) {
//     throw new ApiError(400, "No choices found for student");
//   }

//   // Try each choice by priority
//   student.internshipData = student.internshipData || {};
//   let allocated = null;
//   for (let i = 0; i < choices.length; i++) {
//     const choice = choices[i];
//     if (!choice.company) continue;
//     // Find company
//     const company = await Company.findById(choice.company);
//     if (!company || !company.isActive) continue;
//     // Check seat availability
//     if (company.filledSeats < company.totalSeats) {
//       // Allocate
//       student.internshipData.allocatedCompany = company._id;
//       student.internshipData.allocationStatus = "ALLOCATED";
//       student.internshipData.approvalStatus = "ALLOCATED";
//       // Update timeline history: APPROVED_BY_TPO (with date), ALLOCATED (null date)
//       if (!Array.isArray(student.internshipData.approvalStatusHistory)) {
//         student.internshipData.approvalStatusHistory = [];
//       }
//       student.internshipData.approvalStatusHistory.push({ status: "APPROVED_BY_TPO", createdAt: new Date() });
//       student.internshipData.approvalStatusHistory.push({ status: "ALLOCATED", createdAt: null });
//       await student.save();
//       // Increment filledSeats
//       company.filledSeats += 1;
//       await company.save();
//       allocated = company;
//       break;
//     }
//   }

//   if (allocated) {
//     return res.status(200).json(new ApiResponse(200, { allocatedCompany: allocated }, "Company allocated successfully"));
//   } else {
//     // No company available
//     student.internshipData.allocationStatus = "NOT_ALLOCATED";
//     // Update timeline history: NOT_ALLOCATED (with date)
//     if (!Array.isArray(student.internshipData.approvalStatusHistory)) {
//       student.internshipData.approvalStatusHistory = [];
//     }
//     student.internshipData.approvalStatusHistory.push({ status: "NOT_ALLOCATED", createdAt: new Date() });
//     await student.save();
//     return res.status(200).json(new ApiResponse(200, {}, "No company available for allocation"));
//   }
// });

export {
  registerStudent,
  registerFaculty,
  updateFaculty,
  deleteFaculty,
  getAllStudents,
  getAllFaculties,
  getStudentDetails,
  deleteStudent,
  updateStudentProfile,
  getAllStudentsApplications,
  allocateCompanyToStudent,
  rejectStudentApplication,
  updateStudentAllocatedCompany,
  choiceResetAllStudentApplications,
  fullResetAllStudentApplications,
  bulkRegisterStudentsFromTable,
  getTestStudentProfile,
  bulkDomainRegistrationFromTable,
  downloadStudentTempPassword,
  downloadCompanyStudents,
  downloadAllCompanyStudents,
  getFeatureSettings,
  updateFeatureSettings
  
};
