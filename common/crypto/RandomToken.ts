export namespace RandomToken {
  export const charset_alphanum = '0123456789QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm'
  export const charset_numbers = '0123456789'
  export const charset_smallhex = '0123456789abcdef'

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

  export function barcode() {
    const barcode = from_charset(charset_numbers, 16)
    return barcode.substring(0, 3) + '-' + barcode.substring(3, 11) + '-' + barcode.substring(11, 16)
  }

  export function uuid() {
    const hex = from_charset(charset_smallhex, 32)
    return `${hex.substring(0,8)}-${hex.substring(8,12)}-${hex.substring(12,16)}-${hex.substring(16,20)}-${hex.substring(20,32)}`
  }
}
