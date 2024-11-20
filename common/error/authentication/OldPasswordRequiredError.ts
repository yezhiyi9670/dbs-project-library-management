import UserCausedError from "../UserCausedError";

export default class OldPasswordRequiredError extends UserCausedError {
  id = 'old_password_required'
  msg = ''
  args: unknown[] = []

  constructor(
    field: string
  ) {
    super()
    this.msg = `Updating field "${field}" requires the correct old password.`
    this.args = [field]
  }
}
