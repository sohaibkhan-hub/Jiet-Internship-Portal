import { Router } from "express";
import {
  getAllStudentApplications,
  getStudentApplicationDetails,
  filterStudentsByStatus,
  filterStudentsByApprovalStatus,
  approveStudentApplication,
  rejectStudentApplication,
  getPlacementStats,
  getPendingApprovals,
} from "../controllers/tpo.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/applications", getAllStudentApplications);
router.get("/applications/:studentId", getStudentApplicationDetails);
router.get("/status/:status", filterStudentsByStatus);
router.get("/approval/:approvalStatus", filterStudentsByApprovalStatus);
router.post("/approve/:studentId", verifyJWT, approveStudentApplication);
router.post("/reject/:studentId", verifyJWT, rejectStudentApplication);
router.get("/stats", getPlacementStats);
router.get("/pending-approvals", getPendingApprovals);

export default router;