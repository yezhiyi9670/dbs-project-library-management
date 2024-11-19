export namespace ConfigTyping {
  export function boolean(valueStr: string) {
    if(valueStr.length == 0) {
      return false
    }
    if(valueStr[0].toLowerCase() == 't' || valueStr[0].toLowerCase() == 'y') {
      return true
    }
    return false
  }
  
  export function number(valueStr: string) {
    const value = +valueStr
    if(value != value) {
      throw new TypeError(`Failed to parse config value "${valueStr}" as a number.`)
    }
    return value
  }
  
  export function int(valueStr: string) {
    const value = number(valueStr)
    if(Math.floor(value) != value || value + 1 == value || value - 1 == value) {
      throw new TypeError(`Failed to parse config value "${valueStr}" as a integer.`)
    }
    return value
  }
}
