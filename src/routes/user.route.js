import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);

// protected routes
router.post("/logout", verifyJWT, logoutUser);

export default router;
