import UserCausedError from "../UserCausedError";

export default class AlreadyOverdueError extends UserCausedError {
  id = 'already_overdue'
  msg = ''
  args: unknown[] = []

  constructor(
    barcode: string,
    timestamp: number
  ) {
    super()
    this.msg = `The book with barcode "${barcode}" is already overdue at timestamp ${timestamp} and cannot be renewed. Please return and re-borrow it.`
    this.args = [barcode, timestamp]
  }
}
