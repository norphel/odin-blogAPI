import { Router } from "express";
import {
  getAllPosts,
  getSpecificPost,
  createNewPost,
} from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/posts", getAllPosts);
router.get("/posts/:postID", getSpecificPost);

// secured routes
router.post("/posts", verifyJWT, createNewPost);
