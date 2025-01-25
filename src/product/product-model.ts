import mongoose from "mongoose";

const attributeValueSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
  },
});

const priceConfigurationSchema = new mongoose.Schema({
  priceType: {
    type: String,
    enum: ["base", "aditional"],
  },
  availableOptions: {
    type: Map,
    of: Number,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    priceConfiguration: {
      type: Map,
      of: priceConfigurationSchema,
    },
    attributes: [attributeValueSchema],
    tenantId: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    isPublish: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);

/*
Sample Prise configuration JSON Doc

{
  "Size": {
    "priceType": "base",
    "availableOptions": {
        "Small": 400,
        "Medium": 600,
        "Large": 800
    }
  },
  "Crust": {
    "priceType": "additional",
    "availableOptions": {
        "Thin": 50,
        "Thick": 100
    }
  }
}

Sample Attributes doc

[
  {
    "name": "isHit",
    "value": "Yes",
  },
  {
    "name": "Spiciness",
    "value": "Medium",
  }
]
*/
