import { UserValidation } from "../user/validation";
import { Validation } from "../Validation";

export namespace SessionValidation {
  export function validateUsername_(data: string) {
    UserValidation.validateUsername_(data)
  }
  export function validateSession_(data: string) {
    Validation.validateMaxStrLen_('session', 250, data)
  }
}
