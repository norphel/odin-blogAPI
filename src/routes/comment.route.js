import { Router } from "express";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createComment,
  getCommentsOnPost,
} from "../controllers/comment.controller.js";

// secured routes (user must be authenticated to read and write comments)
router.get("/:postID/comments", verifyJWT, getCommentsOnPost);
router.post("/:postID", verifyJWT, createComment);

export default router;
