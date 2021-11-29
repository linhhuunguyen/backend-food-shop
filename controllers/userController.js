import { ErrorHander } from "../utils/errorhander.js";
import jwt from "jsonwebtoken";
import asynHandler from "express-async-handler";
import User from "../models/userModel.js";
import { sendToken } from "../utils/jwtToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const { CLIENT_URL } = process.env;

//============ ADMIN ===========================//

// Get all users(admin)
export const getAllUser = asynHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json(users);
});

// Get single user (admin)
export const getSingleUser = asynHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`)
    );

  res.status(200).json({ success: true, user });
});

// update User Role -- Admin
export const updateUserRole = asynHandler(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    userFinAndModify: false,
  });
  res.status(200).json({ success: true });
});

// delete User -- Admin
export const deleteUser = asynHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user)
    return next(
      new ErrorHander(`User does not exist width Id: ${req.params.id}`, 400)
    );

  await user.remove();

  res.status(200).json({ success: true, message: "User Deleted Successfully" });
});

// ================== END ADMIN =============== //

// ================ USER =============== //

// Get User Detail
export const getUserDetails = asynHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json(user);
});

// Register a User
export const registerUser = asynHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: { public_id: "this is a sample id", url: "profilepcUrl" },
  });

  sendToken(user, 201, res);
});

export const loginUser = asynHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password is provided
  if (!email || !password)
    return next(new ErrorHander("Please Enter Email & Password", 400));

  try {
    // Check that user exists by email
    const user = await User.findOne({ email }).select("+password");

    if (!user) return next(new ErrorHander("Invalid email or password", 401));

    // Check that password match
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched)
      return next(new ErrorHander("Invalid email or password", 401));

    const refresh_token = createRefreshToken({ id: user._id });

    res.cookie("refreshtoken", refresh_token, {
      httpOnly: true,
      // path: "/api/v1/user/refresh_token",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // sendToken(user, 200, res);

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Logout User

export const logout = async (req, res) => {
  try {
    res.clearCookie("refreshtoken", {
      path: "/api/v1/user/refresh_token",
    });
    return res.json({ msg: "Log out" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

// Forgot Password

export const forgotPassword = asynHandler(async (req, res, next) => {
  const { email } = req.body;

  // Get ResetPassword Token
  // const resetToken = user.getResetPasswordToken();

  // await user.save({ validateBeforeSave: false });

  // const resetPasswordUrl = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/v1/password/reset/${resetToken}`;

  // const url = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

  try {
    const user = await User.findOne({ email });

    if (!user) return next(new ErrorHander("User not found", 404));

    const access_token = user.getResetPasswordToken();

    await user.save();

    const url = `http://localhost:3000/user/reset/${access_token}`;

    try {
      sendEmail(email, url, "Reset your password");
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
    }
  } catch (error) {
    return next(new ErrorHander(error.message, 500));
  }
});

// Reset Password
export const resetPassword = asynHandler(async (req, res, next) => {
  // createing token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return next(
        new ErrorHander(
          "Reset Password Token is invalid or has been expired",
          404
        )
      );

    if (req.body.password !== req.body.confirmPassword)
      return next(new ErrorHander("Password does not password", 400));

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
});

export const updatePassword = asynHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander("password does not match", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

export const updateProfile = asynHandler(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    userFinAndModify: false,
  });

  res.status(200).json({ success: true });
});

// get AccessToken

export const getAccessToken = asynHandler(async (req, res, next) => {
  try {
    const rf_token = req.cookies.refreshtoken;
    if (!rf_token) return res.status(400).json({ msg: "Please login now!" });

    const decodeData = jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodeData.id);
    const access_token = createAccessToken({ id: user.id });
    res.json({ access_token });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

// ============================

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};
