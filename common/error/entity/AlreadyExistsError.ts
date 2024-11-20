import UserCausedError from "../UserCausedError";

export default class AlreadyExistsError extends UserCausedError {
  id = 'already_exists'
  msg = ''
  args: unknown[] = []

  constructor(
    id: string
  ) {
    super()
    this.msg = `The entity "${id}" already exists.`
    this.args = [id]
  }
}
