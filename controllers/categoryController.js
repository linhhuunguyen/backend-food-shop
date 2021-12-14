import Category from "../models/categoryModel.js";
import { ErrorHander } from "../utils/errorhander.js";
import asynHandler from "express-async-handler";

// Create Category -- Admin

const buildAncestors = async (id, parent_id) => {
  let ancest = [];
  try {
    let parent_category = await Category.findOne(
      { _id: parent_id },
      { name: 1, slug: 1, ancestors: 1 }
    ).exec();
    if (parent_category) {
      const { _id, name, slug } = parent_category;
      const ancest = [...parent_category.ancestors];
      ancest.unshift({ _id, name, slug });
      const category = await Category.findByIdAndUpdate(id, {
        $set: { ancestors: ancest },
      });
    }
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const createCategory = asynHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  req.body.parent ? req.body.parent : null;
  const category = await Category.create(req.body);
  buildAncestors(category._id, req.body.parent);
  res.status(201).json({
    success: true,
    category,
  });
});

// Get All category -- Admin

export const getAdminCategories = asynHandler(async (req, res, next) => {
  const categories = await Category.find({ parent: null });
  res.status(200).json(categories);
});

// Get all Category

export const getAllCategories = asynHandler(async (req, res, next) => {
  const categories = await Category.find();
  const categoryCount = await Category.countDocuments();
  res.status(200).json(categories);
});

// get category query slug
export const getCategoriesSlug = asynHandler(async (req, res, next) => {
  try {
    const result = await Category.find({ slug: req.query.slug })
      .select({
        _id: false,
        name: true,
        ancestors: true,
        // "ancestors.slug": true,
        // "ancestors.name": true
      })
      .exec();

    res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

// get descendants of a Category

export const getCategoriesDescendants = asynHandler(async (req, res, next) => {
  try {
    const result = await Category.find({ parent: req.query.parent })
      .select({ _id: true, name: true })
      .exec();
    res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

export const getCategoriesCate3 = asynHandler(async (req, res, next) => {
  try {
    const result = await Category.find({
      "ancestors._id": req.query.category_id,
    })
      .select({ _id: true, name: true })
      .exec();
    res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
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
