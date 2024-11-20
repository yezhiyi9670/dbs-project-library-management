import globalConfig from "../config/globalConfig"

export type CookieName = 'session_id' | 'session_secret'

class CookieInfo {
  __addPrefix(name: string) {
    return globalConfig.cookieNamespace() + '__' + name
  }
  name(name: CookieName) {
    return this.__addPrefix(name)
  }
}

const cookieInfo = new CookieInfo()
export default cookieInfo
