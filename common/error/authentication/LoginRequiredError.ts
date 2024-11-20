import UserCausedError from "../UserCausedError";

export default class LoginRequiredError extends UserCausedError {
  id = 'login_required'
  msg = ''
  args: unknown[] = []

  constructor() {
    super()
    this.msg = `You must login in order to perform this action.`
    this.args = []
  }
}
