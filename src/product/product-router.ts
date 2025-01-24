import express from "express";
import { ProductController } from "./product-controller";
import { asyncWrapper } from "../utils/asyncWrapper";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { ROLES } from "../common/constants";
import productValidator from "./product-validator";

const router = express.Router();
const productController = new ProductController();

// Create product
router.post(
  "/",
  authenticate,
  canAccess([ROLES.ADMIN, ROLES.MANAGER]),
  productValidator,
  asyncWrapper(productController.create),
);

export default router;
