import { Post } from "../models/post.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload } from "../middlewares/multer.middleware.js";
import { body, matchedData, validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const getAllPosts = asyncHandler(async (req, res) => {
  const allPosts = await Post.find({ isPublished: true })
    .populate("author", "displayName username email")
    .populate("comments");
  if (!allPosts || allPosts.length === 0)
    return res.status(200).json({ message: "No posts yet" });
  return res.status(200).json({ posts: allPosts });
});

const getAllPublishedPostsOfAUser = asyncHandler(async (req, res) => {
  const { userID } = req.params;
  const allPostsOfUser = await Post.find({
    author: userID,
    isPublished: true,
  }).populate("comments");

  return res.status(200).json({ posts: allPostsOfUser });
});

const getAllPostsOfAUser = asyncHandler(async (req, res) => {
  const { userID } = req.params;
  if (req.user._id.toString() === userID) {
    const allPostsOfUser = await Post.find({
      author: userID,
    }).populate("comments");

    return res.status(200).json({ posts: allPostsOfUser });
  } else {
    return res.status(400).json({ error: "Unauthorized request" });
  }
});

const getSpecificPost = asyncHandler(async (req, res) => {
  const { postID } = req.params;
  if (mongoose.Types.ObjectId.isValid(postID)) {
    const post = await Post.findById(postID)
      .populate("author", "username displayName email")
      .populate("comments");
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.status(200).json({ post: post });
  } else {
    throw new ApiError(400, "Invalid post ID");
  }
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
      return res.status(400).json({ error: "Thumbnail image is missing" });
    }

    const thumbnailImage = await uploadToCloudinary(thumbnailImageLocalPath);
    if (!thumbnailImage?.url) {
      return res
        .status(500)
        .json({ error: "Error while uploading thumbnail image" });
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

const changePublishedStatus = asyncHandler(async (req, res) => {
  const { postID } = req.params;
  let { isPublished } = req.body;
  if (isPublished === "true") {
    isPublished = true;
  } else if (isPublished === "false") {
    isPublished = false;
  }

  const post = await Post.findById(postID);

  if (!post) {
    res.status(400).json({ message: "Invalid post id" });
  }

  if (post.author.toString() === req.user._id.toString()) {
    post.isPublished = isPublished;
    await post.save();

    if (isPublished === true) {
      return res.status(200).json({ message: "Published successfully" });
    } else {
      return res.status(200).json({ message: "Unpublished successfully" });
    }
  } else {
    return res.status(401).json({ error: "Unauthorized request" });
  }
});

const editPost = [
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
    const { postID } = req.params;

    const post = await Post.findById(postID);
    if (!post) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized request" });
    }

    const results = validationResult(req);

    if (!results.isEmpty()) {
      return res.status(400).json({ error: results.array() });
    }

    // upload thumbnail image to cloudinary
    const thumbnailImageLocalPath = req.file?.path;
    if (!thumbnailImageLocalPath) {
      return res.status(400).json({ error: "Thumbnail image is missing" });
    }

    const thumbnailImage = await uploadToCloudinary(thumbnailImageLocalPath);
    if (!thumbnailImage?.url) {
      return res
        .status(500)
        .json({ error: "Error while uploading thumbnail image" });
    }

    // delete the previous thumbnail image from cloudinary

    const oldThumbnailImageUrl = post.thumbnailImage;
    if (oldThumbnailImageUrl) {
      const response = await deleteFromCloudinary(oldThumbnailImageUrl);
      console.log(response);
    }
    post.thumbnailImage = thumbnailImage.url;

    const data = matchedData(req);

    post.title = data.title;
    post.content = data.content;

    const updatedPost = await post.save();

    return res.status(200).json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  }),
];

const deletePost = asyncHandler(async (req, res) => {
  const { postID } = req.params;

  const post = await Post.findById(postID);

  if (!post) {
    res.status(400).json({ message: "Invalid post id" });
  }

  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(401).json({ error: "Unauthorized request" });
  }

  const author = await User.findById(post.author).select(
    "-password -refreshToken"
  );

  // delete the post itself
  await Post.findByIdAndDelete(postID);

  // delete the post id stored in posts field of user
  author.posts = author.posts.filter((id) => id.toString() !== postID);
  await author.save();

  res.status(200).json({ message: "Post deleted successfully" });
});

export {
  getAllPosts,
  getAllPublishedPostsOfAUser,
  getAllPostsOfAUser,
  getSpecificPost,
  createNewPost,
  changePublishedStatus,
  editPost,
  deletePost,
};
