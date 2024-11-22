import UserCausedError from "../UserCausedError";

export default class NetworkError extends UserCausedError {
  id = 'network_error'
  msg = ''
  args: unknown[] = []

  constructor() {
    super()
    this.msg = `Cannot connect to the server due to network error.`
    this.args = []
  }
}
