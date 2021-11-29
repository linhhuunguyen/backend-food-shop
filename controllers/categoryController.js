import Category from "../models/categoryModel.js";
import { ErrorHander } from "../utils/errorhander.js";
import asynHandler from "express-async-handler";

// Create Category -- Admin

export const createCategory = asynHandler(async (req, res, next) => {
  // req.body.user = req.user.id;

  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    category,
  });
});

// Get All category -- Admin

export const getAdminCategories = asynHandler(async (req, res, next) => {
  const categories = await Category.find();

  const categoryCount = await Category.countDocuments();

  res.status(200).json({
    success: true,
    categories,
    categoryCount,
  });
});

// Get all Category

export const getAllCategories = asynHandler(async (req, res, next) => {
  const categories = await Category.find();

  const categoryCount = await Category.countDocuments();

  res.status(200).json({
    success: true,
    categories,
    categoryCount,
  });
});

// Update Category -- admin

export const updateCategory = asynHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorHander("Category not found", 404));
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidationrs: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    category,
  });
});

// delete category -- admin

export const deleteCategory = asynHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorHander("Category not found", 404));
  }

  await category.remove();

  res.status(200).json({
    success: true,
    message: "Category Delete Successfully",
  });
});
