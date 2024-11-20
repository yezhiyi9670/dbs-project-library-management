export namespace RandomToken {
  export const charset_alphanum = '0123456789QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm'

  export function from_charset(charset: string, length: number) {
    let ret = ''
    for(let i = 0; i < length; i++) {
      ret += charset[Math.floor(Math.random() * charset.length)]
    }
    return ret
  }

  export function alphanum(length: number) {
    return from_charset(charset_alphanum, length)
  }
}
