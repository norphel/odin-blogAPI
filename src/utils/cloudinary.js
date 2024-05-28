import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.error(error);
    return null;
  }
};

const deleteFromCloudinary = async (publicURL) => {
  try {
    const publicID = publicURL.split("/").pop().split(".")[0];

    const response = await cloudinary.uploader.destroy(publicID, {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export { uploadToCloudinary, deleteFromCloudinary };
