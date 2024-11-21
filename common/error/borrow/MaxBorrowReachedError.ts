import UserCausedError from "../UserCausedError";

export default class AlreadyOverdueError extends UserCausedError {
  id = 'max_borrow_reached'
  msg = ''
  args: unknown[] = []

  constructor() {
    super()
    this.msg = `You have already reached the borrow limit.`
    this.args = []
  }
}
