import mysql from 'mysql'
import globalConfig from '../config/globalConfig'
import tableInfo, { TableName } from './tableInfo'
import { DB_DATAVER } from '../version'
import { SqlEscape } from './SqlEscape'
import FieldTooLongError from '@library-management/common/error/validation/FieldTooLongError'
import User from '@library-management/common/entity/user'
import { RandomToken } from '@library-management/common/crypto/RandomToken'
import { PasswordHash } from '../crypto/PasswordHash'
import { UserRole } from '@library-management/common/entity/user/role'
import { EntityUtils } from '@library-management/common/entity/EntityUtils'
import { SqlClause } from './SqlClause'
import Entity from '@library-management/common/entity/Entity'

const varchar_field_len_limit = 250
const text_field_len_limit = 65535

class DbManager {
  connection: mysql.Connection | undefined = undefined
  async initAsync() {
    this.connection = mysql.createConnection(globalConfig.dbConnectionConfig())
    await this.initializeDatabase()
    await this.ensureRootUser()
  }
  queryAsync(sql: string): Promise<any[]>
  queryAsync(sql: string, values: unknown[]): Promise<any[]>
  queryAsync(sql: string, values: unknown[], flatten: false): Promise<any[]>
  queryAsync(sql: string, values: unknown[], flatten: true): Promise<any[][]>
  queryAsync(sql: string, values: unknown[] = [], flatten: boolean = false) {
    return new Promise<any[]>((resolve, reject) => {
      this.connection!.query(sql, values, (err, rows) => {
        if(err != null) {
          reject(err)
          return
        }
        const ret: any[] = []
        for(let i = 0; i < rows.length; i++) {
          const row_obj = rows[i]
          const current: any = flatten ? [] : {}
          ret.push(current)
          for(let key in row_obj) {
            if(flatten) {
              current.push(row_obj[key])
            } else {
              current[key] = row_obj[key]
            }
          }
        }
        resolve(ret)
      })
    })
  }
  async initializeDatabase() {
    const show_dataver_journal = (await this.queryAsync("SHOW TABLES like ?", [
      SqlEscape.addSlashes(tableInfo.name('dataver_journal'))
    ], true))
    const dataver = await(async () => {
      if(show_dataver_journal.length == 0) {
        return -1
      }
      const queryResult = await this.queryAsync("SELECT max(dataver) from ??", [
        tableInfo.name('dataver_journal')
      ], true)
      return queryResult[0][0] as number
    })()
    if(dataver == DB_DATAVER) {
      console.log('Database dataver is up to date.')
      return
    }
    if(dataver > DB_DATAVER) {
      throw new Error(`Database dataver ${dataver} is newer than the application ${DB_DATAVER}.`)
    }
    if(dataver != -1) {
      throw new Error(`Database dataver ${dataver} mismatches with application ${DB_DATAVER}. No migration available.`)
    }
    
    console.log("Database not established, let's do it now.")
    for(const id of tableInfo.idList()) {
      console.log(`> Create table ${tableInfo.name(id)}`)
      await this.queryAsync(
        'CREATE TABLE ' + SqlEscape.escapeId(tableInfo.name(id)) + ' (' + tableInfo.schemaText(id) + ') ENGINE=innoDB'
      )
    }
    console.log('> Update dataver information.')
    await this.queryAsync(
      'INSERT into ??(dataver) values(?)',
      [ tableInfo.name('dataver_journal'), DB_DATAVER ]
    )
    console.log('Database established successfully.')
  }
  async ensureRootUser() {
    const rootUsers = await this.queryAsync(
      "SELECT * from ?? where role=?",
      [tableInfo.name('users'), UserRole.Root]
    )
    if(rootUsers.length > 0) {
      console.log('Root user exists.')
      return
    }
    console.log("Root user does not exist, let's create one.")
    const rootPassword = RandomToken.alphanum(16)
    const newRootUser = new User(
      'root',
      PasswordHash.hash(rootPassword),
      'root@localhost',
      'Root',
      UserRole.Root,
      false,
      true,
      '', ''
    )
    const rootUserDict = EntityUtils.entityToStoredDict(newRootUser)
    this.checkTextFieldsLen_('users', rootUserDict)
    const clause = SqlClause.insertFromDict('users', rootUserDict)
    console.log("> Creating root user.")
    await this.queryAsync(clause)
    console.log('Root user successfully created. Please save the root password since it cannot be accessed later.')
    console.log('#################################')
    console.log('#  ', rootPassword)
    console.log('#################################')
    console.log('For security, please change password immediately after logging into the root user.')
  }

  checkTextFieldLength_(table: TableName, field: string, data: string) {
    const schema = tableInfo.schema(table)
    const tp = (schema as any)[field] as (string | undefined)
    if(tp == undefined) {
      throw new TypeError(`Field "${field}" does not exist in the schematic of table "${table}".`)
    }
    const words = tp.split(' ')
    if(words.length < 1) {
      throw new TypeError(`Field "${field}" in table "${table}" has invalid schematic.`)
    }
    let lenLimit = 0
    if(words[0].startsWith('varchar')) {
      lenLimit = varchar_field_len_limit
    } else if(words[0].startsWith('text')) {
      lenLimit = text_field_len_limit
    } else {
      throw new TypeError(`Field "${field}" in table "${table}" is not varchar or text.`)
    }
    if(data.length > lenLimit) {
      throw new FieldTooLongError(field, text_field_len_limit)
    }
  }
  checkTextFieldsLen_(table: TableName, data: object) {
    const schema = tableInfo.schema(table)
    for(let field in schema) {
      const value = (data as any)[field]
      if(typeof value == 'string') {
        this.checkTextFieldLength_(table, field, value)
      }
    }
  }

  async queryEntitiesAsync<T extends Entity>(Instance: new () => T, sql: string, values: unknown[] = []) {
    return (await this.queryAsync(sql, values)).map(item => EntityUtils.entityFromDict(new Instance(), item))
  }
  async queryEntityAsync<T extends Entity>(Instance: new () => T, sql: string, values: unknown[] = []) {
    const list = await this.queryEntitiesAsync(Instance, sql, values)
    if(list.length == 0) {
      return null
    }
    return list[0]
  }
}

const dbManager = new DbManager()
export default dbManager
