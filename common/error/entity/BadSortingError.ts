import UserCausedError from "../UserCausedError";

export default class BadSortingError extends UserCausedError {
  id = 'bad_sorting'
  msg = ''
  args: unknown[] = []

  constructor(
    key: string
  ) {
    super()
    this.msg = `The sorting key "${key}" does not exist.`
    this.args = [key]
  }
}
