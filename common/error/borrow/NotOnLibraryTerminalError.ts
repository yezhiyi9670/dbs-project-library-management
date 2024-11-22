import UserCausedError from "../UserCausedError";

export default class NotOnLibraryTerminalError extends UserCausedError {
  id = 'not_on_library_terminal'
  msg = ''
  args: unknown[] = []

  constructor() {
    super()
    this.msg = `The action can only be done on a library terminal.`
    this.args = []
  }
}
