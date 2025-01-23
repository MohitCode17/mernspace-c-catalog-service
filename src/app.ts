import express from "express";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import categoryRouter from "./category/category-router";

const app = express();

// Middlewares
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hello from catalog service." });
});

// Routes
app.use("/categories", categoryRouter);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
