import { ConnectionConfig } from 'mysql'
import { ConfigTyping } from './ConfigTyping'

class GlobalConfigManager {
  env: NodeJS.ProcessEnv = {}
  init() {
    // Make a copy of the env
    this.env = { ...process.env }
  }
  optionalEnv<T>(key: string, defaultValue: T): string | T {
    const value = this.env[key]
    if(typeof value != 'string') {
      return defaultValue
    }
    return value
  }
  definiteEnv(key: string) {
    const value = this.env[key]
    if(typeof value != 'string') {
      throw new TypeError(`Mandatory environment variable ${key} is missing.`)
    }
    return value
  }
  dbConnectionConfig(): ConnectionConfig {
    return {
      host: this.definiteEnv('DB_HOST'),
      port: ConfigTyping.int(this.definiteEnv('DB_PORT')),
      database: this.definiteEnv('DB_DATABASE'),
      user: this.definiteEnv('DB_USER'),
      password: this.definiteEnv('DB_PASSWORD'),
      supportBigNumbers: true,
      // debug: this.debug()
    }
  }
  tableNamespace(): string {
    return this.definiteEnv('DB_TABLE_NAMESPACE')
  }
  cookieNamespace(): string {
    return this.definiteEnv('COOKIE_NAMESPACE')
  }
  hashSecret(): string {
    return this.definiteEnv('HASH_SECRET')
  }
  challengeSecret(): string {
    return this.definiteEnv('CHALLENGE_SECRET')
  }
  allowPasswordReset(): boolean {
    return ConfigTyping.boolean(this.optionalEnv('ALLOW_PASSWORD_RESET', 'false'))
  }
  passwordResetLetterInConsole(): boolean {
    return ConfigTyping.boolean(this.optionalEnv('PASSWORD_RESET_LETTER_IN_CONSOLE', 'false'))
  }
  csrfCheck(): boolean {
    return ConfigTyping.boolean(this.optionalEnv('CSRF_CHECK', 'true'))
  }
  isDebug(): boolean {
    return 'production' != this.optionalEnv('NODE_ENV', 'production')
  }
  isTest(): boolean {
    return 'test' == this.optionalEnv('NODE_ENV', 'production')
  }
  maxBorrowTime(): number {
    return ConfigTyping.int(this.optionalEnv('MAX_BORROW_TIME', '' + (86400 * 14)))
  }
  maxBorrowCount(): number {
    return ConfigTyping.int(this.optionalEnv('MAX_BORROW_COUNT', '' + 6))
  }
  sessionExpireTime(): number {
    return ConfigTyping.int(this.optionalEnv('SESSION_EXPIRE_TIME', '' + (86400 * 2)))
  }
  dryRun() {
    this.dbConnectionConfig()
    this.tableNamespace()
    this.cookieNamespace()
    this.hashSecret()
    this.challengeSecret()
  }
}

const globalConfig = new GlobalConfigManager()
export default globalConfig


