import UserCausedError from "../UserCausedError";

export default class PermissionDeniedError extends UserCausedError {
  id = 'permission_denied'
  msg = ''
  args: unknown[] = []

  constructor() {
    super()
    this.msg = `You have no permission to perform this action.`
    this.args = []
  }
}
