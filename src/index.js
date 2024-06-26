import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { DB_NAME } from "./constants.js";

dotenv.config();

const app = express();

// Connect to Database
try {
  console.log(`${process.env.MONGODB_URI}`);
  const connectionInstance = await mongoose.connect(
    `${process.env.MONGODB_URI}/${DB_NAME}`
  );
  console.log(
    `Database connected on HOST: ${connectionInstance.connection.host}`
  );
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on PORT: ${process.env.PORT || 3000}`);
  });
} catch (error) {
  console.log("Database connection failed!", error);
  process.exit(1);
}

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));

//import routes
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";

//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
