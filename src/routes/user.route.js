import { Router } from "express";
import {
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
  updateProfilePicture,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);

// protected routes
router.post("/logout", verifyJWT, logoutUser);
router.get("/profile", verifyJWT, getUserProfile);
router.patch("/profile/profilePicture", verifyJWT, updateProfilePicture);

export default router;
