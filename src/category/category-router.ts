import express from "express";
import { CategoryController } from "./category-controller";
import categoryValidator from "./category-validator";
import { CategoryService } from "./category-service";
import logger from "../config/logger";
import { asyncWrapper } from "../utils/asyncWrapper";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { ROLES } from "../common/constants";
import categoryUpdateValidator from "./category-update-validator";

const router = express.Router();

const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService, logger);

// Create Category
router.post(
  "/",
  authenticate,
  canAccess([ROLES.ADMIN]),
  categoryValidator,
  asyncWrapper(categoryController.create),
);

// Get all category
router.get("/", asyncWrapper(categoryController.index));

// Get category
router.get("/:categoryId", asyncWrapper(categoryController.getOne));

// Create Category
router.patch(
  "/:id",
  authenticate,
  canAccess([ROLES.ADMIN]),
  categoryUpdateValidator,
  asyncWrapper(categoryController.update),
);

// Delete Category
router.delete(
  "/:categoryId",
  authenticate,
  canAccess([ROLES.ADMIN]),
  asyncWrapper(categoryController.destroy),
);

export default router;
