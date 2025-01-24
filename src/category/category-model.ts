import mongoose from "mongoose";
import { Attribute, Category, PriceConfiguration } from "./category-types";

const attributeSchema = new mongoose.Schema<Attribute>({
  name: {
    type: String,
    required: true,
  },
  widgetType: {
    type: String,
    enum: ["switch", "radio"],
    required: true,
  },
  defaultValue: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  availableOptins: {
    type: [String],
    required: true,
  },
});

const priceConfigSchema = new mongoose.Schema<PriceConfiguration>({
  priceType: {
    type: String,
    enum: ["base", "aditional"],
    required: true,
  },
  availableOptions: {
    type: [String],
    required: true,
  },
});

const categorySchema = new mongoose.Schema<Category>(
  {
    name: {
      type: String,
      required: true,
    },
    priceConfiguration: {
      type: Map,
      of: priceConfigSchema,
      required: true,
    },
    attributes: {
      type: [attributeSchema],
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Category", categorySchema);

/*
Sample Category JSON Doc

{
    "name": "Pizza",
    "priceConfiguration": {
      "Size": {
        "priceType": "base",
        "availableOptions": [
          "Small",
          "Medium",
          "Large"
        ]
      },
      "Crust": {
        "priceType": "aditional",
        "availableOptions": [
          "Thin",
          "Thick"
        ]
      }
    },
    "attributes": [
      {
        "name": "isHit",
        "widgetType": "switch",
        "defaultValue": "No",
        "availableOptions": [
          "Yes",
          "No"
        ]
      },
      {
        "name": "Spiciness",
        "widgetType": "radio",
        "defaultValue": "Medium",
        "availableOptions": [
          "Less",
          "Medium",
          "Hot"
        ]
      }
    ]
}
*/
