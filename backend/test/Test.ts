import assert from "assert";
import { PasswordHash } from "../app/crypto/PasswordHash";
import { RandomToken } from "@library-management/common/crypto/RandomToken";
import dbManager from "../app/database/dbManager";
import FieldTooLongError from '@library-management/common/error/validation/FieldTooLongError'

export namespace Test {
  export function header(header: string) {
    console.log(`================ ${header} ================`)
  }
  export function assertPanics(callable: () => void, errorKind: any, msg?: string) {
    try {
      callable()
    } catch(e) {
      if(!(e instanceof errorKind)) {
        console.log(e)
      }
      assert(e instanceof errorKind, msg ?? 'The callable should throw `' + errorKind['name'] + '`, but it did not.')
      return
    }
    assert((null as any) instanceof errorKind, msg ?? 'The callable should panic but it did not.')
  }
  export function start() {
    test__RandomToken()
    test__PasswordHash()
  }

  function test__RandomToken() {
    header('RandomToken')
    const token = RandomToken.alphanum(64)
    console.log('Random 64-digit token:', token)
    console.log('Password hash of the token:', PasswordHash.hash(token))
    assert(token.length == 64, 'The length of the 64-digit token should be 64')
  }
  function test__PasswordHash() {
    header('PasswordHash')
    const password = 'abc123'
    const wrong_password = 'abc124'
    
    const hash = PasswordHash.hash(password)
    console.log('Password hash of abc123:', hash)
    assert(hash.indexOf(':') != -1, 'Hash must contain a colon.')
    const hash2 = PasswordHash.hash(password)
    console.log('Another hash of abc123:', hash2)
    assert(hash != hash2, 'Hashes are expected to be different each time.')

    assert(PasswordHash.verify(password, hash), 'The correct password should pass the verification.')
    assert(PasswordHash.verify(password, hash2), 'The correct password should pass the verification (2).')
    assert(!PasswordHash.verify(wrong_password, hash), 'The wrong password should not pass the verification.')
    assert(!PasswordHash.verify(password, 'sb'), 'Malformed hash should not pass the verification.')
  }
}
