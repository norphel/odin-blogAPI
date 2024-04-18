import { Router } from "express";
import {
  getAllPosts,
  getSpecificPost,
  createNewPost,
} from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import commentRouter from "./comment.route.js";

const router = Router();
router.use("/", commentRouter);

router.get("/", getAllPosts);
router.get("/:postID", getSpecificPost);

// secured routes
router.post("/", verifyJWT, createNewPost);

export default router;
