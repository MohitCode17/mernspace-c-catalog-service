import mongoose from "mongoose";

export interface Topping {
  _id?: mongoose.Types.ObjectId;
  name: string;
  price: number;
  image: string;
  tenantId: string;
}
