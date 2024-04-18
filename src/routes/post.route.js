import { Router } from "express";
import {
  getAllPosts,
  getSpecificPost,
} from "../controllers/post.controller.js";

const router = Router();

router.get("/posts", getAllPosts);
router.get("/posts/:postID", getSpecificPost);
