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
import { CloudinaryStorage } from "../common/services/cloudinaryStorage";
import createHttpError from "http-errors";

const router = express.Router();

const productService = new ProductService();
const cloudinaryStorage = new CloudinaryStorage();
const productController = new ProductController(
  productService,
  cloudinaryStorage,
  logger,
);

// Create product
router.post(
  "/",
  authenticate,
  canAccess([ROLES.ADMIN, ROLES.MANAGER]),
  fileUpload({
    limits: { fileSize: 500 * 1024 }, // Limit file size to 500 KB
    abortOnLimit: true,
    limitHandler: (req, res, next) => {
      const error = createHttpError(400, "File size exceeds the limit");
      next(error);
    },
  }),
  productValidator,
  asyncWrapper(productController.create),
);

export default router;
