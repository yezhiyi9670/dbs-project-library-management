import crypto from 'crypto'
import { RandomToken } from '@library-management/common/crypto/RandomToken'
import globalConfig from '../config/globalConfig'

export namespace PasswordHash {
  export function hmac(text: string, key: string) {
    const method = crypto.createHmac('sha256', key)
    method.setEncoding('base64')
    method.write(text)
    method.end()
    return method.read()
  }
  export function randomSalt() {
    return RandomToken.alphanum(32)
  }
  export function hash(text: string) {
    const salt = randomSalt()
    return salt + ':' + hmac(text + ':' + salt, globalConfig.hashSecret())
  }
  export function verify(text: string, hash: string) {
    const splitIndex = hash.indexOf(':')
    if(splitIndex == -1) {
      return false
    }
    const salt = hash.substring(0, splitIndex)
    const realHash = hash.substring(splitIndex + 1)
    return hmac(text + ':' + salt, globalConfig.hashSecret()) == realHash
  }
}
