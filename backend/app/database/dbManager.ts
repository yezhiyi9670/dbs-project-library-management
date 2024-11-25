import mysql from 'mysql'
import globalConfig from '../config/globalConfig'
import { DB_DATAVER } from '../version'
import { EntityUtils } from '@library-management/common/entity/EntityUtils'
import Entity from '@library-management/common/entity/Entity'
import DbInitializer from './DbInitializer'
import DbConnection from './DbConnection'

class __DbManager {
  private pool: mysql.Pool | undefined = undefined
  async initAsync() {
    this.pool = mysql.createPool(globalConfig.dbConnectionConfig())
    await this.withAtomicAsync(async db => {
      const initializer = new DbInitializer(db)
      await initializer.initAsync(DB_DATAVER)
      await initializer.migrateAsync()
    })
  }
  withConnectionAsync<T>(callback: (connection: DbConnection) => T | Promise<T>) {
    return new Promise<T>((ok, ko) => {
      this.pool!.getConnection(async (err, connection) => {
        if(err) {
          return ko(err)
        }
        try {
          let ret = callback(new DbConnection(connection))
          if(ret instanceof Promise) {
            ret = await ret
          }
          connection.release()
          ok(ret)
        } catch(err) {
          connection.release()
          return ko(err)
        }
      })
    })
  }
  withAtomicAsync<T>(callback: (connection: DbConnection) => T | Promise<T>) {
    return this.withConnectionAsync(async connection => {
      await new Promise<void>((ok, ko) => {
        connection.connection.beginTransaction((err) => {
          if(err) {
            return ko(err)
          }
          ok()
        })
      })
      try {
        let ret = callback(connection)
        if(ret instanceof Promise) {
          ret = await ret
        }
        await new Promise<void>((ok, ko) => {
          connection.connection.commit((err) => {
            if(err) {
              return ko(err)
            }
            ok()
          })
        })
        return ret
      } catch(err) {
        await new Promise<void>((ok, ko) => {
          connection.connection.rollback((err) => {
            ok()
          })
        })
        throw err
      }
    })
  }
}

export type DbManager = __DbManager
const dbManager = new __DbManager()
export default dbManager
