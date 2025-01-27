import { paginationLabels } from "../config/pagination";
import ProductModel from "./product-model";
import { Filter, PaginateQuery, Product } from "./product-types";

export class ProductService {
  async create(product: Product) {
    return (await ProductModel.create(product)) as Product;
  }

  async getProduct(productId: string): Promise<Product | null> {
    return await ProductModel.findOne({ _id: productId });
  }

  async getProducts(q: string, filters: Filter, paginateQuery: PaginateQuery) {
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

    // const result = await aggregate.exec();
    // return result as Product[];

    return ProductModel.aggregatePaginate(aggregate, {
      ...paginateQuery,
      customLabels: paginationLabels,
    });
  }

  async updateProduct(productId: string, product: Product) {
    return (await ProductModel.findOneAndUpdate(
      { _id: productId },
      {
        $set: product,
      },
      {
        new: true,
      },
    )) as Product;
  }

  async delete(productId: string): Promise<Product | null> {
    return await ProductModel.findByIdAndDelete(productId);
  }
}
