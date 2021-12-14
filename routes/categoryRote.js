import express from "express";
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  getAllCategories,
  updateCategory,
  getCategoriesSlug,
  getCategoriesDescendants,
  getCategoriesCate3,
} from "../controllers/categoryController.js";

import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.route("/categories").get(getAllCategories);

router.route("/categories-slug").get(getCategoriesSlug);

router.route("/categories-descendants").get(getCategoriesCate3);

router.route("/categories-3").get(getCategoriesDescendants);

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
