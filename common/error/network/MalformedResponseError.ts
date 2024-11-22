import UserCausedError from "../UserCausedError";

export default class NetworkError extends UserCausedError {
  id = 'malformed_response'
  msg = ''
  args: unknown[] = []

  constructor() {
    super()
    this.msg = `Server returned malformed JSON.`
    this.args = []
  }
}
