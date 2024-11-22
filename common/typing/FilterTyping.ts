export namespace FilterTyping {
  
  export function toSet(v: unknown[] | null | undefined) {
    if(v == null || v.length == 0) {
      return null
    }
    return v
  }
  export function toStringSingular(v: string | null | undefined) {
    if(v == '' || v == null) {
      return null
    }
    return [v]
  }
  export function toString(v: string | null | undefined) {
    if(v == '' || v == null) {
      return null
    }
    return v
  }
  export function toNumber(v: string | null | undefined) {
    if(v == '' || v == null) {
      return null
    }
    return +v
  }

}
