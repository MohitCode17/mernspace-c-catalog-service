import ProductModel from "./product-model";
import { Filter, Product } from "./product-types";

export class ProductService {
  async create(product: Product) {
    return await ProductModel.create(product);
  }

  async getProduct(productId: string): Promise<Product | null> {
    return await ProductModel.findOne({ _id: productId });
  }

  async getProducts(q: string, filters: Filter) {
    const searchQueryRegexp = new RegExp(q, "i");

    const matchQuery = {
      ...filters,
      name: searchQueryRegexp,
    };

    const aggregate = ProductModel.aggregate([
      {
        $match: matchQuery,
      },
      {
        // populated category fields in product document
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                attributes: 1,
                priceConfiguration: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: "$category",
      },
    ]);

    const result = await aggregate.exec();
    return result as Product[];
  }

  async updateProduct(productId: string, product: Product) {
    return await ProductModel.findOneAndUpdate(
      { _id: productId },
      {
        $set: product,
      },
      {
        new: true,
      },
    );
  }
}
