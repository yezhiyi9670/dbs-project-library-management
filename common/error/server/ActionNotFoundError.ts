import UserCausedError from "../UserCausedError";

export default class ActionNotFoundError extends UserCausedError {
  id = 'action_not_found'
  msg = ''
  args: unknown[] = []

  constructor() {
    super()
    this.msg = `This action is not found.`
    this.args = []
  }
}
