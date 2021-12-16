import express from "express";
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  getAllCategories,
  updateCategory,
  getCategoriesSlug,
  getCategories2,
  getCategories3,
} from "../controllers/categoryController.js";

import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.route("/categories").get(getAllCategories);

router.route("/categories-slug").get(getCategoriesSlug);

router.route("/categories-2").get(getCategories2);

router.route("/categories-3").get(getCategories3);

router
  .route("/admin/categories")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminCategories);

router
  .route("/admin/category/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createCategory);

router
  .route("/admin/category/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateCategory)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteCategory);

export default router;
