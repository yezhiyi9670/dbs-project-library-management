import UserCausedError from "../UserCausedError";

export default class InvalidCredentialsError extends UserCausedError {
  id = 'invalid_credentials'
  msg = ''
  args: unknown[] = []

  constructor() {
    super()
    this.msg = `Invalid credentials. Login failed.`
    this.args = []
  }
}
