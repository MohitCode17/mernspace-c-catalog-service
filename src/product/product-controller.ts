import { Request, Response } from "express";
import { NextFunction } from "express-serve-static-core";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Product } from "./product-types";
import { ProductService } from "./product-service";
import { Logger } from "winston";

export class ProductController {
  constructor(
    private productService: ProductService,
    private logger: Logger,
  ) {}

  // We can create a arrow function so that we don't need to manually bind of this.
  create = async (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string));
    }

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
      image: "image.jpeg",
    };

    const newProduct = await this.productService.create(product);

    this.logger.info("Created product", { id: newProduct._id });

    // TODO: image upload
    // TODO: save product to db
    // TODO: send success response
    res.status(201).json({ id: newProduct._id });
  };
}
