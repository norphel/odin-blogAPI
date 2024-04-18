import { Comment } from "../models/comment.model.js";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { upload } from "../middlewares/multer.middleware.js";
import { body, matchedData, validationResult } from "express-validator";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

const createComment = [
  upload.none(),
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Comment text cannot be empty")
    .escape(),

  asyncHandler(async (req, res) => {
    const results = validationResult(req);

    if (!results.isEmpty()) {
      return res.status(400).json({ error: results.array() });
    }

    const data = matchedData(req);
    const { postID } = req.params;
    const authorID = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(postID)) {
      throw new ApiError(400, "Invalid post ID");
    }

    const comment = new Comment({
      text: data.text,
      post: postID,
      author: authorID,
    });

    const savedComment = await comment.save();
    console.log(savedComment);

    // update post
    const post = await Post.findById(postID);
    post.comments.push(savedComment._id);
    await post.save();

    return res
      .status(200)
      .json({ message: "Comment successfully saved", comment: savedComment });
  }),
];

const getCommentsOnPost = asyncHandler(async (req, res) => {
  const { postID } = req.params;

  if (mongoose.Types.ObjectId.isValid(postID)) {
    const commentsOnPost = await Post.findById(postID)
      .populate("comments")
      .select("comments");
    return res.status(200).json({ commentsOnPost: commentsOnPost });
  } else {
    throw new ApiError(400, "Invalid post ID");
  }
});

export { getCommentsOnPost, createComment };
