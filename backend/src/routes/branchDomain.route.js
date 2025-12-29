import { Router } from "express";
import {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  getAllDomains,
  getDomainById,
  createDomain,
  updateDomain,
  getDomainsByName,
  getDomainsByBranchId,
} from "../controllers/branchDomain.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

// Branch routes
router.get("/branches", getAllBranches);
router.get("/branches/:branchId", getBranchById);
router.post("/create-branch", createBranch);
router.put("/branches/:branchId", verifyJWT, updateBranch);

// Domain routes
router.get("/all-domains", getAllDomains);
router.get("/:domainId", getDomainById);
router.post("/domain-name", getDomainsByName);
router.post("/create-domain", createDomain);
router.put("/update/:domainId", verifyJWT, updateDomain);
router.get("/domains-branchId/:branchId", getDomainsByBranchId);

export default router;
