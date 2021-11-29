// Create Token and saving in cookie
import dotenv from "dotenv";
dotenv.config();

export const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  // options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, user, token });

  // res.status(statusCode).json({ sucess: true, user, token });
};
