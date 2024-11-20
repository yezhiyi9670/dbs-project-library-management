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
    test__fieldLenCheck()
  }

  function test__RandomToken() {
    header('RandomToken')
    const token = RandomToken.alphanum(64)
    console.log('Random 64-digit token:', token)
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
  function test__fieldLenCheck() {
    header('fieldLenCheck')
    
    const veryLongText = '1'.repeat(100000)
    const mediumText = '1'.repeat(1024)
    const shortText = '1'.repeat(250)

    assertPanics(
      () => dbManager.checkTextFieldLength_('users', 'sb', shortText),
      TypeError, 'Checking non-existent field should result in TypeError'
    )
    assertPanics(
      () => dbManager.checkTextFieldLength_('users', 'enabled', shortText),
      TypeError, 'Checking non-text field should result in TypeError'
    )
    assertPanics(
      () => dbManager.checkTextFieldLength_('users', 'display_name', veryLongText),
      FieldTooLongError, 'Checking very long text on text field should result in FieldTooLongError'
    )
    assertPanics(
      () => dbManager.checkTextFieldLength_('users', 'username', mediumText),
      FieldTooLongError, 'Checking medium text on varchar field should result in FieldTooLongError'
    )
    dbManager.checkTextFieldLength_('users', 'display_name', mediumText)
    dbManager.checkTextFieldLength_('users', 'username', shortText)
  }
}
