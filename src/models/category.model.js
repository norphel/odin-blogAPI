import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({
  category: String,
});

export const Category = mongoose.model("Category", categorySchema);
