import FieldInvalidError from "../error/validation/FieldInvalidError"
import Entity from "./Entity"

export namespace EntityUtils {
  /**
   * Create entity instance from potentially user-supplied dict
   */
  export function fromDict<T extends Entity>(newInstance: T, dict: Object, strict: boolean = true) {
    for(let key in dict) {
      const expectedType = typeof (newInstance as any)[key]
      let value = (dict as any)[key]
      const suppliedType = typeof value
      if(!(key in newInstance) || key in {}) {
        if(strict) {
          throw new FieldInvalidError(key, '' + (dict as any)[key])
        } else {
          continue
        }
      }
      if(expectedType != suppliedType || suppliedType == 'function') {
        if(expectedType == 'boolean' && suppliedType == 'number') {
          value = (value != 0)
        } else {
          throw new FieldInvalidError(key, '' + (dict as any)[key])
        }
      }
      (newInstance as any)[key] = value
    }
    newInstance.validate_()
    return newInstance
  }
  /**
   * Create dict from entity instance
   */
  function toDictShallow<T extends Entity>(instance: T): Object {
    const ret = {}
    const derivativeFields = instance.derivativeFields()
    for(let key in instance) {
      if(key.substring(0, 2) == '__' || typeof (instance as any)[key] == 'function') {
        continue
      }
      if(key.substring(0, 1) == '$' && (instance as any)[key] == null) {
        continue
      }
      if(!instance.__hasDerivatives && derivativeFields.indexOf(key) != -1) {
        continue
      }
      (ret as any)[key] = (instance as any)[key]
    }
    return ret
  }
  /**
   * Create dict from entity instance
   */
  export function toStoredDict<T extends Entity>(instance: T): Object {
    const dict = toDictShallow(instance)
    for(let key in dict) {
      if(key.substring(0, 1) == '$') {
        delete (dict as any)[key]  // Do not store foreign field
        continue
      }
      let value = (dict as any)[key]
      if(typeof value == 'boolean') {
        value = value ? 1 : 0
      }
      (dict as any)[key] = value
    }
    for(let key of instance.derivativeFields()) {
      delete (dict as any)[key]
    }
    return dict
  }
  /**
   * Create dict from entity instance for display
   */
  export function toDisplayDict<T extends Entity>(instance: T | null, isManageApi: boolean): Object | null {
    if(instance == null) {
      return null
    }
    const dict = toDictShallow(instance)
    for(let key in dict) {
      if(key.substring(0, 1) == '$') {
        (dict as any)[key] = toDisplayDict((dict as any)[key], false)
      }
    }
    for(let key of instance.sensitiveFields(isManageApi)) {
      delete (dict as any)[key]
    }
    return dict
  }
}
