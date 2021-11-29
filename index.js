import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import errorMiddlewares from "./middlewares/error.js";
import fileUpload from "express-fileupload";
import product from "./routes/productRoute.js";
import user from "./routes/userRoute.js";
import order from "./routes/orderRoute.js";
import category from "./routes/categoryRote.js";

// Config

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

// CONNECT DB
connectDB();

app.get("/", (req, res) => {
  res.send("Hello Word");
});

app.use("/api/v1", product);
app.use("/api/v1", category);
app.use("/api/v1", user);
app.use("/api/v1", order);

// Middleware for Errors
app.use(errorMiddlewares);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
