import { UserRole } from "../../entity/user/role";
import UserCausedError from "../UserCausedError";

export default class StockDeprecatedError extends UserCausedError {
  id = 'stock_deprecated'
  msg = ''
  args: unknown[] = []

  constructor(
    barcode: string
  ) {
    super()
    this.msg = `The book with barcode "${barcode}" is deprecated and cannot be borrowed.`
    this.args = [barcode]
  }
}
