import UserCausedError from "../UserCausedError";

export default class FieldTooLongError extends UserCausedError {
  id = 'field_too_long'
  msg = ''
  args: unknown[] = []

  constructor(
    fieldName: string,
    lengthLimit: number
  ) {
    super()
    this.msg = `The field "${fieldName}" has exceeded the max length ${lengthLimit} and cannot be stored.`
    this.args = [ fieldName, lengthLimit ]
  }
}
