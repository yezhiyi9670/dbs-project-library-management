import UserCausedError from "../UserCausedError";

export default class FieldInvalidError extends UserCausedError {
  id = 'field_invalid'
  msg = ''
  args: unknown[] = []

  constructor(
    fieldName: string,
    value: unknown
  ) {
    super()
    this.msg = `The field "${fieldName}" has failed validation.`
    this.args = [ fieldName, value ]
  }
}
