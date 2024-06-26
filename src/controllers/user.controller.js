import { asyncHandler } from "../utils/asyncHandler.js";
import { body, matchedData, validationResult } from "express-validator";
import { upload } from "../middlewares/multer.middleware.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const generateAccessAndRefreshTokens = async (user) => {
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating tokens",
      error
    );
  }
};

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
      return res.status(400).json({ errors: result.array() });
    }

    const data = matchedData(req);

    // check if username already exists
    const existingUsername = await User.findOne({ username: data.username });

    if (existingUsername) {
      return res.status(409).json({ error: "username already taken" });
    }

    // check if email already exists
    const existingEmail = await User.findOne({ email: data.email });

    if (existingEmail) {
      return res
        .status(409)
        .json({ error: "A user with given email already exists." });
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
      res.status(500).json({
        error: "Something went wrong while registering. Please try again",
      });
    }

    // return response
    return res.status(201).json({
      user: createdUser,
      msg: "User registered successfully! Kindly login now.",
    });
  }),
];

const loginUser = [
  upload.none(),

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
    .escape(),

  asyncHandler(async (req, res) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      res.status(400).json({ errors: result.array() });
    }

    const data = matchedData(req);

    const user = await User.findOne({ email: data.email });
    if (!user) {
      return res.status(404).json({ error: "No user with given email exist" });
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      return res.status(404).json({ error: "Incorrect password!" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user
    );
    const authenticatedUser = await User.findById(user._id).select(
      "_id displayName username"
    );

    const options = { httpOnly: true };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        user: authenticatedUser,
        msg: "User logged in successfully",
      });
  }),
];

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
    }
  );

  const options = { httpOnly: true, secure: true };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "User logged out successfully" });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );

  if (user.profilePicture === undefined) {
    user.profilePicture = "";
  }
  res.json({ user: user });
});

const updateProfilePicture = [
  upload.single("profilePicture"),

  asyncHandler(async (req, res) => {
    const localPath = req.file?.path;

    if (!localPath) {
      throw new ApiError(400, "Profile Picture file is missing");
    }

    const profilePicture = await uploadToCloudinary(localPath);
    if (!profilePicture?.url) {
      throw new ApiError(400, "Error while uploading profile photo");
    }

    // delete the previous profile photo from cloudinary
    const user = await User.findById(req.user?._id).select(
      "-password -refreshToken"
    );

    const oldPhotoURL = user.profilePicture;
    if (oldPhotoURL) {
      const response = deleteFromCloudinary(oldPhotoURL);
      console.log(response);
    }
    user.profilePicture = profilePicture.url;
    const updatedUser = await user.save();

    return res.status(200).json({
      message: "Profile photo updated successfully",
      user: updatedUser,
    });
  }),
];

export {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateProfilePicture,
};
