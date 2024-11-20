import FieldInvalidError from "../../error/validation/FieldInvalidError"
import { TitleValidation } from "../title/validation"
import { Validation } from "../Validation"

export namespace StockValidation {
  export function validateBookNumber_(data: string) {
    return TitleValidation.validateBookNumber_(data)
  }
  export function validateBarcode_(data: string) {
    Validation.validateMaxStrLen_('barcode', 60, data)
    if(!/^[0-9A-Za-z\_\-\$]+$/.test(data)) {
      throw new FieldInvalidError('barcode', data)
    }
  }
  export function validateNotes_(data: string) {
    Validation.validateMaxStrLen_('notes', 65535, data)
  }
}
