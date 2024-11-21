import UserCausedError from "../UserCausedError";

export default class NotBorrowedByYouError extends UserCausedError {
  id = 'not_borrowed_by_you'
  msg = ''
  args: unknown[] = []

  constructor(
    barcode: string
  ) {
    super()
    this.msg = `The book with barcode "${barcode}" is not borrowed by you.`
    this.args = [barcode]
  }
}
