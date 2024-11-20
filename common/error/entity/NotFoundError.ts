import UserCausedError from "../UserCausedError";

export default class NotFoundError extends UserCausedError {
  id = 'not_found'
  msg = ''
  args: unknown[] = []

  constructor(
    id: string
  ) {
    super()
    this.msg = `The entity "${id}" is not found.`
    this.args = [id]
  }
}
