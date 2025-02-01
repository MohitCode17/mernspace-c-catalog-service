import ToppingModel from "./topping-model";
import { Topping } from "./topping-types";

export class ToppingService {
  create = async (topping: Topping) => {
    return await ToppingModel.create(topping);
  };

  getAll = async (tenantId: string) => {
    // TODO: PAGINATIONS, QUERY, ETC.
    return await ToppingModel.find({ tenantId });
  };
}
