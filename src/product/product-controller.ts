import { Request, Response } from "express";
import { NextFunction } from "express-serve-static-core";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Filter, Product, ProductEvents } from "./product-types";
import { ProductService } from "./product-service";
import { Logger } from "winston";
import { FileStorage } from "../common/types/storage";
import { UploadedFile } from "express-fileupload";
import { AuthRequest } from "../common/types";
import { ROLES } from "../common/constants";
import mongoose from "mongoose";
import { MessageProducerBroker } from "../common/types/broker";
import { mapToObject } from "../utils";

export class ProductController {
  constructor(
    private productService: ProductService,
    private storage: FileStorage,
    private broker: MessageProducerBroker,
    private logger: Logger,
  ) {}

  // We can create a arrow function so that we don't need to manually bind of this.
  create = async (req: Request, res: Response, next: NextFunction) => {
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
      image: imagePublicId,
    };

    const newProduct = await this.productService.create(product);

    // SEND PRODUCT OBJECT TO KAFKA
    await this.broker.sendMessage(
      "product",
      JSON.stringify({
        event_type: ProductEvents.PRODUCT_CREATE,
        data: {
          id: newProduct._id,
          // TODO: FIX THE TYPESCRIPT ERROR
          priceConfiguration: mapToObject(
            newProduct.priceConfiguration as unknown as Map<string, any>,
          ),
        },
      }),
    );

    this.logger.info("Created product", { id: newProduct._id });

    res.status(201).json({ id: newProduct._id });
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string));
    }

    // Get productId from params
    const { productId } = req.params;

    // Get product with ID
    const product = await this.productService.getProduct(productId);
    if (!product) {
      return next(createHttpError(404, "Product not found."));
    }

    // Check if tenant has access to the product
    if ((req as AuthRequest).auth.role !== ROLES.ADMIN) {
      const tenant = (req as AuthRequest).auth.tenant;
      if (product.tenantId !== String(tenant)) {
        return next(
          createHttpError(403, "You are not allow to access this product."),
        );
      }
    }

    let updatedImagePublicId = product.image; // Keep the old image by default

    // Check if user send the new image
    if (req.files?.image) {
      const image = req.files.image as UploadedFile;

      // Generate a new unique filename
      const nameWithoutExtension = image.name.replace(/\.[^/.]+$/, "");
      const uniqueFilename = `${Date.now()}-${nameWithoutExtension}`;

      updatedImagePublicId = await this.storage.upload({
        filename: uniqueFilename,
        fileData: image.data.buffer,
      });

      // Delete the old image from Cloudinary if it exists
      if (product.image) {
        await this.storage.delete(product.image);
      }
    }

    // Update product details
    const {
      name,
      description,
      priceConfiguration,
      attributes,
      tenantId,
      categoryId,
      isPublish,
    } = req.body as Product;

    const updatedProduct = {
      name,
      description,
      priceConfiguration: JSON.parse(priceConfiguration),
      attributes: JSON.parse(attributes),
      tenantId,
      categoryId,
      isPublish,
      image: updatedImagePublicId,
    };

    const savedproduct = await this.productService.updateProduct(
      productId,
      updatedProduct,
    );

    // Send Product to kafka
    await this.broker.sendMessage(
      "product",
      JSON.stringify({
        event_type: ProductEvents.PRODUCT_UPDATE,
        data: {
          id: savedproduct._id,
          priceConfiguration: mapToObject(
            savedproduct.priceConfiguration as unknown as Map<string, any>,
          ),
        },
      }),
    );

    res
      .status(200)
      .json({ message: "Product updated successfully", id: savedproduct?._id });
  };

  index = async (req: Request, res: Response, next: NextFunction) => {
    // Getting queries like search, filter, etc.
    const { q, tenantId, categoryId, isPublish } = req.query;

    // Filter objects
    const filters: Filter = {};

    if (isPublish === "true") {
      filters.isPublish = true;
    }

    if (tenantId) {
      filters.tenantId = tenantId as string;
    }

    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId as string)) {
      filters.categoryId = new mongoose.Types.ObjectId(categoryId as string);
    }

    const products = await this.productService.getProducts(
      q as string,
      filters,
      {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      },
    );

    const finalProducts = (products.data as Product[]).map(
      (product: Product) => ({
        ...product,
        image: this.storage.getObjectUri(product.image),
      }),
    );

    this.logger.info("All products has been fetched.");

    res.json({
      data: finalProducts,
      total: products.total,
      pageSize: products.limit,
      currentPage: products.page,
    });
  };

  getone = async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    const product = await this.productService.getProduct(productId);
    this.logger.info("Product is fetched", { id: product?._id });

    res.json(product);
  };

  destroy = async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    const product = await this.productService.getProduct(productId);

    if (!product) {
      return next(createHttpError(404, "Product not found."));
    }

    // Check if tenant has access to the product
    if ((req as AuthRequest).auth.role !== ROLES.ADMIN) {
      const tenant = (req as AuthRequest).auth.tenant;
      if (product.tenantId !== String(tenant)) {
        return next(
          createHttpError(403, "You are not allow to access this product."),
        );
      }
    }

    // Destroy the product image from cloudinary
    if (product.image) {
      await this.storage.delete(product.image);
    }

    // Delete the product from database
    await this.productService.delete(productId);

    this.logger.info("Product deleted successfully", { id: productId });

    res.json({ message: "Product has been deleted.", id: productId });
  };
}
