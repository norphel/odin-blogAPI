import { Post } from "../models/post.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload } from "../middlewares/multer.middleware.js";
import { body, matchedData, validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

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

const createNewPost = [
  upload.single("thumbnailImage"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Post title is required")
    .escape(),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Post content is required")
    .escape(),

  asyncHandler(async (req, res) => {
    const results = validationResult(req);

    if (!results.isEmpty()) {
      return res.status(400).json({ error: results.array() });
    }

    // upload thumbnail image to cloudinary
    const thumbnailImageLocalPath = req.file?.path;
    if (!thumbnailImageLocalPath) {
      throw new ApiError(400, "Thumbnail image is missing");
    }

    const thumbnailImage = await uploadToCloudinary(thumbnailImageLocalPath);
    if (!thumbnailImage.url) {
      throw new ApiError(400, "Error while uploading thumbnail image");
    }

    const data = matchedData(req);
    const authorID = req.user._id;
    const post = new Post({
      title: data.title,
      content: data.content,
      thumbnailImage: thumbnailImage.url,
      author: authorID,
    });

    const savedPost = await post.save();

    //update user.posts
    const user = await User.findById(authorID);
    user.posts.push(savedPost._id);
    await user.save();
    res
      .status(200)
      .json({ message: "Post saved successfully", post: savedPost });
  }),
];

export { getAllPosts, getSpecificPost, createNewPost };
