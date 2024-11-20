import User from "."
import FieldInvalidError from "../../error/validation/FieldInvalidError"
import { Validation } from "../Validation"
import { UserRole } from "./role"

export namespace UserValidation {
  export function validateUsername_(data: string) {
    Validation.validateMaxStrLen_('username', 30, data)
    if(!/^[0-9A-Za-z\_\-\$]+$/.test(data)) {
      throw new FieldInvalidError('username', data)
    }
  }

  export function validateEmail_(data: string) {
    Validation.validateMaxStrLen_('email', 250, data)
    const atPos = data.indexOf('@')
    if(atPos == -1 || data.indexOf('@', atPos + 1) != -1) {
      throw new FieldInvalidError('email', data)
    }
  }

  export function validateDisplayName_(data: string) {
    Validation.validateMaxStrLen_('display_name', 30, data)
  }

  export function validateRole_(data: string) {
    if(Object.values(UserRole).indexOf(data as any) == -1) {
      throw new FieldInvalidError('role', data)
    }
  }

  export function validatePrivateKey_(data: string) {
    Validation.validateMaxStrLen_('private_key', 65535, data)
  }

  export function validatePublicKey_(data: string) {
    Validation.validateMaxStrLen_('public_key', 65535, data)
  }
}
