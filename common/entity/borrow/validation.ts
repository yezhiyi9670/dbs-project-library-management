import { StockValidation } from "../stock/validation"
import { UserValidation } from "../user/validation"
import { Validation } from "../Validation"

export namespace BorrowValidation {
  export function validateSeq_(data: number) {
    Validation.validateIsInt_('seq', data)
  }
  export function validateUsername_(data: string) {
    return UserValidation.validateUsername_(data)
  }
  export function validateBarcode_(data: string) {
    return StockValidation.validateBarcode_(data)
  }
  export function validateNotes_(data: string) {
    Validation.validateMaxStrLen_('notes', 65535, data)
  }
  export function validateTime_(data: number) {
    Validation.validateIsInt_('time', data)
  }
}
