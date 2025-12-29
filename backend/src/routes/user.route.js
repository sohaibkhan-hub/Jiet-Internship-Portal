import { Router } from "express";
import {
	loginUser,
	getCurrentUser,
	changePassword,
	logoutUser,
	deleteAllUsersAndStudents,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();


router.post("/login", loginUser);
router.get("/me", verifyJWT, getCurrentUser);
router.post("/change-password", verifyJWT, changePassword);
router.post("/logout", verifyJWT, logoutUser);
router.get("/delete-all", deleteAllUsersAndStudents);

export default router;
