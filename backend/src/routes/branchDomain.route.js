import { Router } from "express";
import {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  getAllDomains,
  getDomainById,
  createDomain,
  updateDomain,
  deleteDomain,
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
router.delete("/branches/:branchId", verifyJWT, deleteBranch);

// Domain routes
router.get("/all-domains", getAllDomains);
router.get("/:domainId", getDomainById);
router.post("/domain-name", getDomainsByName);
router.post("/create-domain", createDomain);
router.put("/update/:domainId", verifyJWT, updateDomain);
router.delete("/delete/:domainId", verifyJWT, deleteDomain);
router.get("/domains-branchId/:branchId", getDomainsByBranchId);

export default router;
