import UserCausedError from "../UserCausedError";

export default class MalformedDataError extends UserCausedError {
  id = 'malformed_data'
  msg = ''
  args: unknown[] = []

  constructor() {
    super()
    this.msg = `Client sent malformed data to the API.`
    this.args = []
  }
}
