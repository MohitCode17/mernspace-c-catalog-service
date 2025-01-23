export interface Attribute {
  name: string;
  widgetType: "switch" | "radio";
  defaultValue: string;
  availableOptins: string[];
}

export interface PriceConfiguration {
  [key: string]: {
    priceType: "base" | "aditional";
    availableOptions: string[];
  };
}

export interface Category {
  name: string;
  priceConfiguration: PriceConfiguration;
  attributes: Attribute[];
}
