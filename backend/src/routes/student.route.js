import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
	getStudentProfile,
	updateStudentProfile,
	updateSurveyPreferences,
	submitInternshipChoices,
	getApplicationStatus,
	updateStudentDomain,
	getAllCompaniesWithDomains,
	generateTrainingLetterPdf,
	getFeatureSettingsPublic,
} from "../controllers/student.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/profile", verifyJWT, getStudentProfile);
router.put("/update-profile", verifyJWT, updateStudentProfile);
router.get("/domain-companies/:domainId", verifyJWT, getAllCompaniesWithDomains);
router.put("/survey", verifyJWT, updateSurveyPreferences);
router.post("/submit-choices", verifyJWT, 
	upload.fields([
		{ name: "resume_1", maxCount: 1 },
		{ name: "resume_2", maxCount: 1 },
		{ name: "resume_3", maxCount: 1 },
		{ name: "resume_4", maxCount: 1 },
	]), submitInternshipChoices);
router.get("/application-status", verifyJWT, getApplicationStatus);
router.put("/update-domain", verifyJWT, updateStudentDomain);
router.get("/training-letter/:studentId", verifyJWT, generateTrainingLetterPdf);
router.get("/feature-flags", verifyJWT, getFeatureSettingsPublic);

export default router;
