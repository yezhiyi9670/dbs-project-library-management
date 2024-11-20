import UserCausedError from "../UserCausedError";

export default class UnknownError extends UserCausedError {
  id = 'unknown_error'
  msg = ''
  args: unknown[] = []

  constructor() {
    super()
    this.msg = `Unspecified error occured while handling the request.`
    this.args = []
  }
}
