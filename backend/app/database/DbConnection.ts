import Entity from '@library-management/common/entity/Entity'
import { EntityUtils } from '@library-management/common/entity/EntityUtils'
import mysql from 'mysql'

type EntityConstructor<T> = (new () => T) | [() => T]
function normalizeEntityConstructor<T>(func: EntityConstructor<T>): () => T {
  if(Array.isArray(func)) {
    return func[0]
  }
  return () => new func()
}

export default class DbConnection {
  constructor(
    /**
     * 连接
     */
    public connection: mysql.PoolConnection
  ) {}

  queryAsync(sql: string): Promise<any[]>
  queryAsync(sql: string, values: unknown[]): Promise<any[]>
  queryAsync(sql: string, values: unknown[], flatten: false): Promise<any[]>
  queryAsync(sql: string, values: unknown[], flatten: true): Promise<any[][]>
  queryAsync(sql: string, values: unknown[] = [], flatten: boolean = false) {
    return new Promise<any[]>((ok, ko) => {
      this.connection!.query(sql, values, (err, rows) => {
        if(err != null) {
          ko(err)
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
        ok(ret)
      })
    })
  }
  async queryOneAsync(sql: string, values: unknown[] = []) {
    const results = await this.queryAsync(sql, values)
    if(results.length == 0) {
      return null
    }
    return results[0]
  }
  
  sqlErrorRethrow_(err: unknown, handlers: {[code: string]: (err: Error) => Error}) {
    if(!(err instanceof Error)) {
      throw err
    }
    if(!('code' in err) || typeof err.code != 'string') {
      throw err
    }
    if(!(err.code in {}) && handlers[err.code]) {
      throw handlers[err.code](err)
    }
    throw err
  }

  async queryEntitiesAsync<T extends Entity>(Instance: EntityConstructor<T>, sql: string, values: unknown[] = []) {
    const ctor = normalizeEntityConstructor(Instance)
    return (await this.queryAsync(sql, values)).map(item => EntityUtils.fromDict(ctor(), item))
  }
  async queryEntityAsync<T extends Entity>(Instance: EntityConstructor<T>, sql: string, values: unknown[] = []) {
    const list = await this.queryEntitiesAsync(Instance, sql, values)
    if(list.length == 0) {
      return null
    }
    return list[0]
  }
  async queryCountAsync(sql: string, values: unknown[] = []) {
    // Change into a count query
    sql = `SELECT count(*) from (${sql}) AS count`

    const result = await this.queryAsync(sql, values, true)
    return result[0][0] as number
  }
}
