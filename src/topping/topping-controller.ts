import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { FileStorage } from "../common/types/storage";
import { ToppingService } from "./topping-service";
import { Topping, ToppingEvents } from "./topping-types";
import { Logger } from "winston";
import { MessageProducerBroker } from "../common/types/broker";
import { Filter } from "../product/product-types";

export class ToppingController {
  constructor(
    private storage: FileStorage,
    private toppingService: ToppingService,
    private broker: MessageProducerBroker,
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
      fileData: image.data.buffer as ArrayBuffer,
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

    await this.broker.sendMessage(
      "topping",
      JSON.stringify({
        event_type: ToppingEvents.TOPPING_CREATE,
        data: {
          id: newTopping._id,
          price: newTopping.price,
          tenantId: newTopping.tenantId,
        },
      }),
    );

    this.logger.info("Created product", { id: newTopping._id });

    res.status(201).json({ id: newTopping._id });
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    // GETTING QUESRIES LIKE SEARCH, FILTER, ETC.
    const { q, tenantId } = req.query;

    const filters: Filter = {};

    if (tenantId) {
      filters.tenantId = tenantId as string;
    }

    const toppings = await this.toppingService.getAll(q as string, filters, {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    });

    const finalToppings = (toppings.data as Topping[]).map(
      (topping: Topping) => ({
        ...topping,
        image: this.storage.getObjectUri(topping.image),
      }),
    );

    this.logger.info("All topping has been fetched.");

    res.json({
      data: finalToppings,
      total: toppings.total,
      pageSize: toppings.limit,
      currentPage: toppings.page,
    });
  };
}
