import { Router } from "express";
import {
  triggerBatchAllocation,
  getAllocationStatus,
  resetAllocation,
  exportAllocationList,
  getCompanyWiseAllocation,
  getBranchWiseAllocationSummary,
} from "../controllers/allocation.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/trigger", verifyJWT, triggerBatchAllocation);
router.get("/status", getAllocationStatus);
router.post("/reset", verifyJWT, resetAllocation);
router.get("/export", exportAllocationList);
router.get("/company-wise", getCompanyWiseAllocation);
router.get("/branch-wise", getBranchWiseAllocationSummary);

export default router;