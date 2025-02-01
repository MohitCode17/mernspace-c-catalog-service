import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { FileStorage } from "../common/types/storage";
import { ToppingService } from "./topping-service";
import { Topping } from "./topping-types";
import { Logger } from "winston";

export class ToppingController {
  constructor(
    private storage: FileStorage,
    private toppingService: ToppingService,
    private logger: Logger,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    // Validate the body
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string));
    }

    // Ensure that the image is provided in the req.
    const image = req.files?.image as UploadedFile;

    if (!image) {
      return next(createHttpError(400, "Image file is required."));
    }

    // Generate a unique filename without appending an extension
    const nameWithoutExtension = image.name.replace(/\.[^/.]+$/, "");
    const uniqueFilename = `${Date.now()}-${nameWithoutExtension}`;

    // Upload the image to cloudinary using the FileStorage abstraction
    const imagePublicId = await this.storage.upload({
      filename: uniqueFilename,
      fileData: image.data.buffer,
    });

    const { name, price, tenantId } = req.body as Topping;

    const topping = {
      name,
      price,
      tenantId,
      image: imagePublicId,
    };

    // Create new Topping
    const newTopping = await this.toppingService.create(topping);

    this.logger.info("Created product", { id: newTopping._id });

    res.status(201).json({ id: newTopping._id });
  };
}
