import express from "express";
import fileUpload from "express-fileupload";
import { ToppingController } from "./topping-controller";
import { asyncWrapper } from "../utils/asyncWrapper";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { ROLES } from "../common/constants";
import { ToppingService } from "./topping-service";
import logger from "../config/logger";
import { CloudinaryStorage } from "../common/services/cloudinaryStorage";
import createHttpError from "http-errors";
import createToppingValidator from "./create-topping-validator";

const router = express.Router();

const toppingService = new ToppingService();
const cloudinaryStorage = new CloudinaryStorage();
const toppingController = new ToppingController(
  cloudinaryStorage,
  toppingService,
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
  createToppingValidator,
  asyncWrapper(toppingController.create),
);

// Get All Toppings
router.get("/", asyncWrapper(toppingController.getAll));

export default router;
