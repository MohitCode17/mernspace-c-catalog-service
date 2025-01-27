import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Category, PriceConfiguration } from "./category-types";
import { CategoryService } from "./category-service";
import { Logger } from "winston";

export class CategoryController {
  constructor(
    private categoryService: CategoryService,
    private logger: Logger,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string));
    }

    const { name, priceConfiguration, attributes } = req.body as Category;

    const category = await this.categoryService.create({
      name,
      priceConfiguration,
      attributes,
    });

    this.logger.info("Created category", { id: category._id });

    res.status(201).json({ id: category._id });
  };

  index = async (req: Request, res: Response, next: NextFunction) => {
    const categories = await this.categoryService.getAll();
    this.logger.info("All categories has been fetched");
    res.json(categories);
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const category = await this.categoryService.getOne(categoryId);
    this.logger.info("Category has been fetched", { id: category?._id });
    res.json(category);
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string));
    }

    const categoryId = req.params.id;
    const updateData = req.body as Partial<Category>;

    const existingCategory = await this.categoryService.getOne(categoryId);

    if (!existingCategory) {
      return next(createHttpError(404, "Category not found"));
    }

    if (updateData.priceConfiguration) {
      // Convert existing Map to object if it's a Map
      const existingConfig =
        existingCategory.priceConfiguration instanceof Map
          ? Object.fromEntries(existingCategory.priceConfiguration)
          : existingCategory.priceConfiguration;

      // Merge configurations
      const mergedConfig: PriceConfiguration = {
        ...existingConfig,
        ...updateData.priceConfiguration,
      };

      updateData.priceConfiguration = mergedConfig;
    }

    const updatedCategory = await this.categoryService.update(
      updateData,
      categoryId,
    );

    this.logger.info(`Updated category`, { id: categoryId });

    res.json({
      id: updatedCategory?._id,
    });
  };
}
