import ProductModel from "./product-model";
import { Product } from "./product-types";

export class ProductService {
  async create(product: Product) {
    return await ProductModel.create(product);
  }

  async getProduct(productId: string): Promise<Product | null> {
    return await ProductModel.findOne({ _id: productId });
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
