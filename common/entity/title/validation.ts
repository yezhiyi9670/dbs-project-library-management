import FieldInvalidError from "../../error/validation/FieldInvalidError"
import { Validation } from "../Validation"

export namespace TitleValidation {
  export function validateBookNumber_(data: string) {
    Validation.validateMaxStrLen_('book_number', 60, data)
    if(!/^[0-9A-Za-z\_\-\$]+$/.test(data)) {
      throw new FieldInvalidError('book_number', data)
    }
  }
  export function validateTitle_(data: string) {
    Validation.validateMaxStrLen_('title', 2048, data)
  }
  export function validateAuthor_(data: string) {
    Validation.validateMaxStrLen_('author', 2048, data)
  }
  export function validatePublisher_(data: string) {
    Validation.validateMaxStrLen_('publisher', 2048, data)
  }
  export function validatePlace_(data: string) {
    Validation.validateMaxStrLen_('place', 2048, data)
  }
  export function validateUrl_(data: string) {
    Validation.validateMaxStrLen_('url', 2048, data)
  }
  export function validateYear_(data: number) {
    Validation.validateIsInt_('year', data)
  }
  export function validatePrice_(data: number) {
    Validation.validateIsInt_('price_milliunit', data)
  }
  export function validateDescription_(data: string) {
    Validation.validateMaxStrLen_('description', 65535, data)
  }
  export function validateToPurchaseAmount_(data: number) {
    Validation.validateIsInt_('to_purchase_amount', data)
    if(data < 0) {
      throw new FieldInvalidError('to_purchase_amount', data)
    }
  }
}
