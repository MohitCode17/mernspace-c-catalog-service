import { Request, Response } from "express";
import { NextFunction } from "express-serve-static-core";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Product } from "./product-types";
import { ProductService } from "./product-service";
import { Logger } from "winston";
import { FileStorage } from "../common/types/storage";
import { UploadedFile } from "express-fileupload";

export class ProductController {
  constructor(
    private productService: ProductService,
    private storage: FileStorage,
    private logger: Logger,
  ) {}

  // We can create a arrow function so that we don't need to manually bind of this.
  create = async (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string));
    }

    // Ensure that the image is provided in the req.
    const image = req.files?.image as UploadedFile | undefined;

    if (!image) {
      return next(createHttpError(400, "Image file is required."));
    }

    // Generate a unique filename for the image
    const imageName = `${Date.now()}-${image.name}`;

    // Upload the image to cloudinary using the FileStorage abstraction
    const imageUrl = await this.storage.upload({
      filename: imageName,
      fileData: image.data.buffer,
    });

    // Create product
    const {
      name,
      description,
      priceConfiguration,
      attributes,
      tenantId,
      categoryId,
      isPublish,
    } = req.body as Product;

    const product = {
      name,
      description,
      priceConfiguration: JSON.parse(priceConfiguration),
      attributes: JSON.parse(attributes),
      tenantId,
      categoryId,
      isPublish,
      // Todo Image
      image: imageUrl, // save the cloudinary public id or secure url in the product record
    };

    const newProduct = await this.productService.create(product);

    this.logger.info("Created product", { id: newProduct._id });

    res.status(201).json({ id: newProduct._id });
  };
}
