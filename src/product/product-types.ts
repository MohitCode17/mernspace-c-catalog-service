import mongoose from "mongoose";

export interface Product {
  _id?: mongoose.Types.ObjectId;
  name: string;
  description: string;
  // TODO: FIX THE PRICE CONFIGURATION TYPE
  priceConfiguration: string;
  attributes: string;
  tenantId: string;
  categoryId: string;
  isPublish: boolean;
  image: string;
}

export interface Filter {
  tenantId?: string;
  categoryId?: mongoose.Types.ObjectId;
  isPublish?: boolean;
}

export interface PaginateQuery {
  page: number;
  limit: number;
}

export enum ProductEvents {
  PRODUCT_CREATE = "PRODUCT_CREATE",
  PRODUCT_UPDATE = "PRODUCT_UPDATE",
  PRODUCT_DELETE = "PRODUCT_DELETE",
}
