import express from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import categoryRouter from "./category/category-router";
import cookieParser from "cookie-parser";

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "Hello from catalog service." });
});

// Routes
app.use("/categories", categoryRouter);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
