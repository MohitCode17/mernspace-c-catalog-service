import express from "express";
import fileUpload from "express-fileupload";
import { ProductController } from "./product-controller";
import { asyncWrapper } from "../utils/asyncWrapper";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { ROLES } from "../common/constants";
import productValidator from "./product-validator";
import { ProductService } from "./product-service";
import logger from "../config/logger";

const router = express.Router();

const productService = new ProductService();
const productController = new ProductController(productService, logger);

// Create product
router.post(
  "/",
  authenticate,
  canAccess([ROLES.ADMIN, ROLES.MANAGER]),
  fileUpload(),
  productValidator,
  asyncWrapper(productController.create),
);

export default router;
