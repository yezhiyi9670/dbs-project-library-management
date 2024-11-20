import UserCausedError from "../UserCausedError";

export default class NoDataError extends UserCausedError {
  id = 'no_data'
  msg = ''
  args: unknown[] = []

  constructor() {
    super()
    this.msg = `No data is submitted.`
    this.args = []
  }
}
