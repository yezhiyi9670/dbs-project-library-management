export default class UserCausedError extends Error {
  id: string = 'user_caused_error_base'
  msg: string = ''
  args: unknown[] = []
}
