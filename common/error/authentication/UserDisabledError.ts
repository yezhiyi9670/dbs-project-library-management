import UserCausedError from "../UserCausedError";

export default class UserDisabledError extends UserCausedError {
  id = 'user_disabled'
  msg = ''
  args: unknown[] = []

  constructor(username: string) {
    super()
    this.msg = `The user "${username}" is disabled by an administrator.`
    this.args = [username]
  }
}
