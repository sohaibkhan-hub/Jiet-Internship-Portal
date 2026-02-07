import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
	registerStudent,
	bulkRegisterStudentsFromTable,
	registerFaculty,
	updateFaculty,
	deleteFaculty,
	getAllStudents,
	getAllFaculties,
	getAllStudentsApplications,
	updateStudentProfile,
	getStudentDetails,
	deleteStudent,
	allocateCompanyToStudent,
	rejectStudentApplication,
	updateStudentAllocatedCompany,
	choiceResetAllStudentApplications,
	fullResetAllStudentApplications,
	downloadStudentTempPassword,
	downloadCompanyStudents,
	downloadAllCompanyStudents,
	getFeatureSettings,
	updateFeatureSettings,
	bulkDomainRegistrationFromTable,
} from "../controllers/admin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();


router.post("/register-student", verifyJWT, registerStudent);
router.post("/register-faculty", verifyJWT, registerFaculty);
router.put("/faculties/:facultyId", verifyJWT, updateFaculty);
router.delete("/faculties/:facultyId", verifyJWT, deleteFaculty);
router.get("/all-students", verifyJWT, getAllStudents);
router.get("/all-faculties", verifyJWT, getAllFaculties);
router.get("/student-details/:email", verifyJWT, getStudentDetails);
router.delete("/students/:studentId", verifyJWT, deleteStudent);
router.post("/update-student", verifyJWT, updateStudentProfile);
router.get("/all-student-applications", verifyJWT, getAllStudentsApplications);
router.post("/allocate-company", verifyJWT, allocateCompanyToStudent);
router.post("/reject-application", verifyJWT, rejectStudentApplication);
router.post("/update-allocated-company",  verifyJWT, updateStudentAllocatedCompany);
router.post("/reset-student-choices", verifyJWT, choiceResetAllStudentApplications);
router.post("/full-reset-students", verifyJWT, fullResetAllStudentApplications);
router.get("/download-student-temp-passwords", verifyJWT, downloadStudentTempPassword);
router.post("/download-company-students", verifyJWT, downloadCompanyStudents);
router.get("/download-all-company-students", verifyJWT, downloadAllCompanyStudents);
router.get("/feature-flags", verifyJWT, getFeatureSettings);
router.put("/feature-flags", verifyJWT, updateFeatureSettings);
router.route("/bulk-domain-register").post( upload.array('students', 1), bulkDomainRegistrationFromTable);
router.route("/bulk-register").post( upload.array('students', 1), bulkRegisterStudentsFromTable);
// router.post("/manual-domain-student-register", manualDomainStudentRegistration);
// router.post("/test-profile", getTestStudentProfile); // For testing purposes

export default router;
