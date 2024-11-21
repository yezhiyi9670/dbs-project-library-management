import FieldInvalidError from "../../error/validation/FieldInvalidError"
import { StockValidation } from "../stock/validation"
import { UserValidation } from "../user/validation"
import { Validation } from "../Validation"

export namespace BorrowValidation {
  export function validateUuid_(data: string) {
    Validation.validateMaxStrLen_('uuid', 60, data)
    if(!/^[0-9a-f]{8}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{12}$/.test(data)) {
      throw new FieldInvalidError('uuid', data)
    }
  }
  export function validateUsername_(data: string) {
    return UserValidation.validateUsername_(data)
  }
  export function validateBarcode_(data: string) {
    return StockValidation.validateBarcode_(data)
  }
  export function validateNotes_(data: string) {
    Validation.validateMaxStrLen_('borrow_notes', 65535, data)
  }
  export function validateTime_(data: number) {
    Validation.validateIsInt_('time', data)
  }
}
