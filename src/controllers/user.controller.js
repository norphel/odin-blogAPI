import { asyncHandler } from "../utils/asyncHandler.js";
import { body, matchedData, validationResult } from "express-validator";
import multer from "multer";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";

const upload = multer();

const registerUser = [
  upload.none(),

  body("displayName")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .escape(),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("username is required")
    .escape(),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .escape(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 24 })
    .withMessage("Password must be 8-24 characters long")
    .escape(),

  asyncHandler(async (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.json({ errors: result.array() });
    }

    const data = matchedData(req);

    // check if username already exists
    const existingUsername = await User.findOne({ username: data.username });

    if (existingUsername) {
      throw new ApiError(409, "username already taken");
    }

    // check if email already exists
    const existingEmail = await User.findOne({ email: data.email });

    if (existingEmail) {
      throw new ApiError(
        409,
        "User with this email exists. Consider signing up."
      );
    }

    // create user entry in db
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = new User({
      displayName: data.displayName,
      username: data.username,
      email: data.email,
      password: hashedPassword,
    });

    await user.save();

    // check if user saved in db
    const createdUser = await User.findById(user._id).select(
      "displayName username"
    );

    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering. Please try again"
      );
    }

    // return response
    return res
      .status(201)
      .json({ user: createdUser, msg: "User registered successfully" });
  }),
];

export { registerUser };
