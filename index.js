import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import errorMiddlewares from "./middlewares/error.js";
import product from "./routes/productRoute.js";
import user from "./routes/userRoute.js";

const app = express();
dotenv.config();
connectDB();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json())

app.get("/", (req, res) => {
  res.send("Hello Word");
});

app.use("/api/v1", product);
app.use("/api/v1", user);

// Middleware for Errors
app.use(errorMiddlewares);

const PORT = process.env.port || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
