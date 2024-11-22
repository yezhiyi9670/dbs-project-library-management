import MalformedResponseError from '@library-management/common/error/network/MalformedResponseError'
import NetworkError from '@library-management/common/error/network/NetworkError'
import UserCausedError from '@library-management/common/error/UserCausedError'
import UnknownError from '@library-management/common/error/unknown/UnknownError'

export namespace Api {

  export interface SuccessResult {
    success: true,
    data: any
  }
  export interface Error {
    code: string,
    args: any[]
  }
  export interface ErrorResult {
    success: false,
    data: Error
  }

  async function call(method: 'get' | 'post', path: string, data: Object = {}): Promise<SuccessResult | ErrorResult> {
    let response = null
    try {
      response = await fetch('api/' + path, {
        method: method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data)
      })
    } catch(err) {
      console.log(err)
      return { success: false, data: { code: new NetworkError().id, args: [] } }
    }
    let json = null
    try {
      json = await response.json()
    } catch(err) {
      return { success: false, data: { code: new MalformedResponseError().id, args: [] } }
    }
    if(json['errorCode'] != null) {
      return {
        success: false,
        data: {
          code: json['errorCode'],
          args: json['data']['args']
        }
      }
    }
    return {
      success: true,
      data: json['data']
    }
  }
  export async function post(path: string, data: Object = {}) {
    const result = await call('post', path, data)
    // await new Promise((resolve) => setTimeout(resolve, 1000))  // Delibrate throttle for testing
    return result
  }

  export function errorMessage(error: Error, isIsForm: boolean = false) {
    /* TODO: Make error message understandable */
    return error.code + '(' + error.args.join(', ') + ')'
  }

  export function validationRules(validators_: ((v: any) => void)[]) {
    return validators_.map(validator_ => {
      return function(v: any) {
        try {
          if(!v) {
            return true
          }
          validator_(v)
        } catch(err) {
          if(!(err instanceof UserCausedError)) {
            err = new UnknownError()
          }
          if(!(err instanceof UserCausedError)) {
            return 'sb'
          }
          return errorMessage({ code: err.id, args: err.args }, true)
        }
        return true
      }
    })
  }

}