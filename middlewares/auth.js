import asynHandler from "express-async-handler";
import User from "../models/userModel.js";
import { ErrorHander } from "../utils/errorhander.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const isAuthenticatedUser = asynHandler(async (req, res, next) => {
  // const { token } = req.cookies;

  const token = req.header("Authorization");

  if (!token) {
    return next(new ErrorHander("Please Login to access this resource"));
  }

  try {
    const decodeData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodeData.id);

    if (!user) {
      return next(new ErrorHander("No user found with this id", 404));
    }

    req.user = user;

    next();
  } catch (error) {
    return next(new ErrorHander("Not authorized to access this router", 401));
  }
});

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHander(
          `Role: ${req.user.role} is not allowed to access this resouce `,
          403
        )
      );
    }

    next();
  };
};
