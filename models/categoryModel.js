import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter category name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please enter category description"],
      trim: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
