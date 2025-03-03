import { paginationLabels } from "../config/pagination";
import { Filter, PaginateQuery } from "../product/product-types";
import ToppingModel from "./topping-model";
import { Topping } from "./topping-types";

export class ToppingService {
  create = async (topping: Topping) => {
    return await ToppingModel.create(topping);
  };

  getAll = async (q: string, filters: Filter, paginateQuery: PaginateQuery) => {
    const searchQueryRegexp = new RegExp(q, "i"); // case in-sensitive

    const matchQuery = {
      ...filters,
      name: searchQueryRegexp,
    };

    const aggregate = ToppingModel.aggregate([
      {
        $match: matchQuery,
      },
    ]);

    return ToppingModel.aggregatePaginate(aggregate, {
      ...paginateQuery,
      customLabels: paginationLabels,
    });
  };
}
