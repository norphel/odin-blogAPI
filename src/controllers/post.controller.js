import { Post } from "../models/post.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllPosts = asyncHandler(async (req, res) => {
  const allPosts = await Post.find();
  if (!allPosts) return res.status(200).json({ message: "No posts yet" });
  return res.status(200).json({ posts: allPosts });
});

const getSpecificPost = asyncHandler(async (req, res) => {
  const { postID } = req.params.postID;
  const post = await Post.findById(postID);
  if (!post) return res.status(404).json({ message: "Post not found" });
  return res.status(200).json({ post: post });
});

export { getAllPosts, getSpecificPost };
