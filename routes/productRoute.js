import express from "express";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDeatails,
} from "../controllers/productController.js";

import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.get("/products", isAuthenticatedUser, getAllProducts);

router.route("/product/:id").get(getProductDeatails);
router
  .route("/product/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);
router.route("/product/:id").put(isAuthenticatedUser, updateProduct);
router.route("/product/:id").delete(isAuthenticatedUser, deleteProduct);

export default router;
