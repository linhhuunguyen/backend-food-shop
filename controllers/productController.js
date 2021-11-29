import Product from "../models/productModel.js";
import ApiFeatures from "../utils/apifeatures.js";
import { ErrorHander } from "../utils/errorhander.js";
import asynHandler from "express-async-handler";
import { uploads } from "../utils/cloudinary.js";
import fs from "fs";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

// Get All Product (Admin)

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const getAdminProducts = asynHandler(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json(products);
});

// Create Product -- Admin
export const createProduct = asynHandler(async (req, res, next) => {
  // const urls = [];
  // const files = req.files;
  // for (const file of files) {
  //   const { path } = file;
  //   const result = await cloudinary.v2.uploader.upload(path, {
  //     folder: "products",
  //   });
  //   urls.push({ public_id: result.public_id, url: result.secure_url });
  // }

  const urls = [];
  const file = req.files.file;
  const newPath = await cloudinary.v2.uploader.upload(
    file.tempFilePath,
    {
      folder: "products",
    },
    async (err, result) => {
      if (err) return err;
      removeTmp(file.tempFilePath);
      return result;
    }
  );

  urls.push({ url: newPath.url });
  // console.log(newPath);

  req.body.images = urls;
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// Update Product

export const updateProduct = asynHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidationrs: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

// Delete Product

export const deleteProduct = asynHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product Delete Successfully",
  });
});

// Create New Review or Update the review

export const createProductReview = asynHandler(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get All Reviews of a product

export const getProductReviews = asynHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

export const deleteReview = asynHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  const ratings = avg / product.reviews.length;

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidationrs: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

//============ USER =====================

// Get All Product
export const getAllProducts = asynHandler(async (req, res, next) => {
  const resultPerPage = 5;
  const productCount = await Product.countDocuments();

  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

  const products = await apiFeature.query;

  res.status(200).json(products);
});

// Get Product Details

export const getProductDeatails = asynHandler(async (req, res, next) => {
  console.log(req.params);

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

const removeTmp = (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};
