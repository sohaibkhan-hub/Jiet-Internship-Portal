import { Router } from "express";
import {
  addCompany,
  getAllCompanies,
  getCompanyById,
  getCompaniesForStudent,
  updateCompanyDetails,
  updateCompanySeats,
  getCompanySeats,
  getAllCompaniesWithBranch,
  deleteCompany,
} from "../controllers/company.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.post("/add-company", verifyJWT, addCompany);
router.get("/all-companies", getAllCompanies);
router.get("/all-companies-with-branch/:branchId", verifyJWT, getAllCompaniesWithBranch);
router.get("/:companyId", getCompanyById);
router.get("/eligible", getCompaniesForStudent);
router.put("/:companyId", verifyJWT, updateCompanyDetails);
router.delete("/:companyId", verifyJWT, deleteCompany);
router.put("/:companyId/seats", verifyJWT, updateCompanySeats);
router.get("/:companyId/seats", getCompanySeats);

export default router;
