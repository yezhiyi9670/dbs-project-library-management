import FieldInvalidError from "../error/validation/FieldInvalidError";
import FieldTooLongError from "../error/validation/FieldTooLongError";

export namespace Validation {
  export function validateIsNumber_(field: string, data: unknown) {
    if(typeof data != 'number' || data != data) {
      throw new FieldInvalidError(field, data)
    }
  }
  export function validateIsInt_(field: string, data: unknown) {
    if(typeof data != 'number' || data != data) {
      throw new FieldInvalidError(field, data)
    }
    if(Math.floor(data) != data || data + 1 == data || data - 1 == data) {
      throw new FieldInvalidError(field, data)
    }
  }
  export function validateIsStr_(field: string, data: unknown) {
    if(typeof data != 'string') {
      throw new FieldInvalidError(field, data)
    }
  }
  export function validateMaxStrLen_(field: string, limit: number, data: unknown) {
    if(typeof data != 'string') {
      throw new FieldInvalidError(field, data)
    }
    if(data.length > limit) {
      throw new FieldTooLongError(field, limit)
    }
  }
  export function validateIsListOf_(field: string, validator_: (k: string, v: any) => void, data: unknown) {
    if(!Array.isArray(data)) {
      throw new FieldInvalidError(field, data)
    }
    data.forEach(item => {
      validator_(field, item)
    })
  }

  export type ValidatorSpecification = ((k: string, v: any) => void) | [(k: string, v: any) => void]

  /**
   * Based on validator specifications, validate and extract data from request body
   */
  export function getApiInputs_(body: any, items: {
    [key: string]: ValidatorSpecification
  }) {
    const ret: {[key: string]: any} = {}
    for(let key in items) {
      let validator_ = items[key]
      let optional = false
      const value = body[key]
      if(typeof validator_ != 'function') {
        optional = true
        validator_ = validator_[0]
      }
      if(!optional || value != null) {
        validator_(key, value)
      }
      ret[key] = value
    }
    return ret
  }
  export const paginationInputs: {[key: string]: ValidatorSpecification} = {
    pn: [(k, v) => validateIsInt_(k, v)],
    rn: [(k, v) => validateIsInt_(k, v)]
  }
}