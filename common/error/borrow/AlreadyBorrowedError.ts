import { UserRole } from "../../entity/user/role";
import UserCausedError from "../UserCausedError";

export default class AlreadyBorrowedError extends UserCausedError {
  id = 'already_borrowed'
  msg = ''
  args: unknown[] = []

  constructor(
    barcode: string
  ) {
    super()
    this.msg = `The book with barcode "${barcode}" is already borrowed.`
    this.args = [barcode]
  }
}
