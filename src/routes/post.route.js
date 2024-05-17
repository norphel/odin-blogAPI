import { Router } from "express";
import {
  getAllPosts,
  getSpecificPost,
  createNewPost,
  getAllPublishedPostsOfAUser,
  getAllPostsOfAUser,
  changePublishedStatus,
  editPost,
  deletePost,
} from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import commentRouter from "./comment.route.js";

const router = Router();
router.use("/", commentRouter);

router.get("/", getAllPosts);
router.get("/:postID", getSpecificPost);
router.get("/user/:userID/published", getAllPublishedPostsOfAUser);

// secured routes
router.post("/", verifyJWT, createNewPost);
router.get("/user/:userID/all", verifyJWT, getAllPostsOfAUser);
router.patch("/:postID/published", verifyJWT, changePublishedStatus);
router.patch("/:postID/edit", verifyJWT, editPost);
router.delete("/:postID", verifyJWT, deletePost);
export default router;
