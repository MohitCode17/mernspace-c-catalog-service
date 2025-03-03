import mongoose, { AggregatePaginateModel } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Topping } from "./topping-types";

const toppingSchema = new mongoose.Schema<Topping>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    tenantId: { type: String, required: true },
  },
  { timestamps: true },
);

// Apply the plugin
toppingSchema.plugin(aggregatePaginate);

// Explicitly define model with AggregatePaginateModel<Topping>
const ToppingModel = mongoose.model<Topping, AggregatePaginateModel<Topping>>(
  "Topping",
  toppingSchema,
);

export default ToppingModel;
