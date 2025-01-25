import { Request, Response } from "express";
import { NextFunction } from "express-serve-static-core";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Product } from "./product-types";
import { ProductService } from "./product-service";
import { Logger } from "winston";
import { FileStorage } from "../common/types/storage";
import { UploadedFile } from "express-fileupload";
import { AuthRequest } from "../common/types";
import { ROLES } from "../common/constants";

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

    // Generate a unique filename without appending an extension
    const nameWithoutExtension = image.name.replace(/\.[^/.]+$/, ""); // Remove any existing extension
    const uniqueFilename = `${Date.now()}-${nameWithoutExtension}`; // No manual extension added

    // Upload the image to cloudinary using the FileStorage abstraction
    const imageUrl = await this.storage.upload({
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
      // Todo Image
      image: imageUrl, // save the cloudinary public id or secure url in the product record
    };

    const newProduct = await this.productService.create(product);

    this.logger.info("Created product", { id: newProduct._id });

    res.status(201).json({ id: newProduct._id });
  };

  // Helper method to extract the public ID from a Cloudinary URL
  private extractPublicId(imageUrl: string): string {
    const parts = imageUrl.split("/");
    const fileNameWithExtension = parts[parts.length - 1];
    const publicId = fileNameWithExtension.split(".")[0]; // Remove the file extension
    return publicId;
  }

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

    // Variables for image handling
    let updatedImageUrl = product.image; // Keep the old image by default

    // Check if user send the new image
    if (req.files?.image) {
      const image = req.files.image as UploadedFile;

      // Generate a new unique filename
      const nameWithoutExtension = image.name.replace(/\.[^/.]+$/, ""); // Remove any existing extension
      const uniqueFilename = `${Date.now()}-${nameWithoutExtension}`; // No manual extension added

      updatedImageUrl = await this.storage.upload({
        filename: uniqueFilename,
        fileData: image.data.buffer,
      });

      // Delete the old image from Cloudinary if it exists
      if (product.image) {
        const oldPublicId = this.extractPublicId(product.image);
        const deletedImage = await this.storage.delete(oldPublicId);
        console.log(deletedImage);
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
      image: updatedImageUrl,
    };

    const savedproduct = await this.productService.updateProduct(
      productId,
      updatedProduct,
    );

    res
      .status(200)
      .json({ message: "Product updated successfully", id: savedproduct?.id });
  };
}
