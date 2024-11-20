import FieldInvalidError from "../error/validation/FieldInvalidError"
import Entity from "./Entity"

export namespace EntityUtils {
  /**
   * Create entity instance from potentially user-supplied dict
   */
  export function entityFromDict<T extends Entity>(newInstance: T, dict: Object) {
    for(let key in dict) {
      const expectedType = typeof (newInstance as any)[key]
      let value = (dict as any)[key]
      const suppliedType = typeof value
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
  function entityToDict<T extends Entity>(instance: T): Object {
    const ret = {}
    for(let key in instance) {
      if(typeof (instance as any)[key] == 'function') {
        continue
      }
      (ret as any)[key] = (instance as any)[key]
    }
    return ret
  }
  /**
   * Create dict from entity instance
   */
  export function entityToStoredDict<T extends Entity>(instance: T): Object {
    const dict = entityToDict(instance)
    for(let key in dict) {
      let value = (dict as any)[key]
      if(typeof value == 'boolean') {
        value = value ? 1 : 0
      }
      (dict as any)[key] = value
    }
    return dict
  }
  /**
   * Create dict from entity instance for display
   */
  export function entityToSanitizedDict<T extends Entity>(instance: T | null, isManageApi: boolean): Object | null {
    if(instance == null) {
      return null
    }
    const dict = entityToDict(instance)
    for(let key of instance.sensitiveFields(isManageApi)) {
      delete (dict as any)[key]
    }
    return dict
  }
}
