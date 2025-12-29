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
} from "../controllers/student.controller.js";

const router = Router();

router.get("/profile", verifyJWT, getStudentProfile);
router.put("/update-profile", verifyJWT, updateStudentProfile);
router.get("/domain-companies/:domainId", verifyJWT, getAllCompaniesWithDomains);
router.put("/survey", verifyJWT, updateSurveyPreferences);
router.post("/submit-choices", verifyJWT, submitInternshipChoices);
router.get("/application-status", verifyJWT, getApplicationStatus);
router.put("/update-domain", verifyJWT, updateStudentDomain);

export default router;
