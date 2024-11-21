import { UserRole } from "@library-management/common/entity/user/role";
import { DbManager } from "./dbManager";
import { SqlEscape } from "./SqlEscape";
import tableInfo, { TableOrViewName } from "./tableInfo";
import { RandomToken } from "@library-management/common/crypto/RandomToken";
import User from "@library-management/common/entity/user";
import { PasswordHash } from "../crypto/PasswordHash";
import { SqlClause } from "./SqlClause";
import { EntityUtils } from "@library-management/common/entity/EntityUtils";
import DbConnection from "./DbConnection";

export default class DbInitializer {
  old_dataver = -1
  target_dataver = -1

  constructor(
    private connection: DbConnection
  ) {}

  async initAsync(target_dataver: number) {
    const show_dataver_journal = (await this.connection.queryAsync("SHOW TABLES like ?", [
      SqlEscape.addSlashes(tableInfo.name('dataver_journal'))
    ], true))
    const dataver = await(async () => {
      if(show_dataver_journal.length == 0) {
        return -1
      }
      const queryResult = await this.connection.queryAsync("SELECT max(dataver) from ??", [
        tableInfo.name('dataver_journal')
      ], true)
      return (queryResult[0][0] ?? -1) as number
    })()
    this.old_dataver = dataver
    this.target_dataver = target_dataver
  }

  async migrateAsync() {
    await this.__update()
    await this.__ensureRoot()
  }

  async __update() {
    function ETN(id: TableOrViewName) {
      return SqlEscape.escapeId(tableInfo.name(id))
    }

    if(this.target_dataver == -1) {
      throw new Error('Attempted to start database migration before init.')
    }
    if(this.old_dataver == this.target_dataver) {
      console.log('Database dataver is up to date.')
      return
    }
    if(this.old_dataver > this.target_dataver) {
      throw new Error(`Database dataver ${this.old_dataver} is newer than the application ${this.target_dataver}.`)
    }
    if(this.old_dataver < Math.min(this.target_dataver, 1)) {
      console.log("Migration: -> 1")
      for(const id of tableInfo.idList()) {
        console.log(`> Creating table ${tableInfo.name(id)}`)
        await this.connection.queryAsync(
          'CREATE TABLE ' + ETN(id) + ' (' + tableInfo.schemaText(id) + ') ENGINE=innoDB'
        )
      }
      console.log('> Update dataver information.')
      await this.connection.queryAsync(
        'INSERT into ??(dataver) values(?)',
        [ tableInfo.name('dataver_journal'), 1 ]
      )
      console.log('Database established successfully.')
      this.old_dataver = 1
    }
    if(this.old_dataver < Math.min(this.target_dataver, 2)) {
      console.log('Migration: 1 -> 2')

      console.log(`> Creating view ${tableInfo.name('stocks_view_borrowed')}`)
      await this.connection.queryAsync(
        `CREATE VIEW ${ETN('stocks_view_borrowed')} as
        SELECT barcode, exists(
          SELECT barcode from ${ETN('borrows')}
          Where barcode=${ETN('stocks')}.barcode and returned=0
        ) borrowed, coalesce((
          SELECT username from ${ETN('borrows')}
          Where barcode=${ETN('stocks')}.barcode and returned=0 Limit 1
        ), '') borrowed_by, coalesce((
          SELECT max(due_time) from ${ETN('borrows')}
          Where barcode=${ETN('stocks')}.barcode and returned=0
        ), 0) borrowed_due from ${ETN('stocks')}`
      )

      console.log(`> Creating view ${tableInfo.name('titles_view_stats')}`)
      await this.connection.queryAsync(
        `CREATE VIEW ${ETN('titles_view_stats')} as
        SELECT book_number, (
          SELECT count(barcode) from ${ETN('stocks')}
          Where book_number=${ETN('titles')}.book_number
        ) total, (
          SELECT count(barcode) from ${ETN('stocks')} natural join ${ETN('stocks_view_borrowed')}
          Where book_number=${ETN('titles')}.book_number and borrowed=1
        ) borrowed, (
          SELECT count(barcode) from ${ETN('stocks')}
          Where book_number=${ETN('titles')}.book_number and deprecated=1
        ) deprecated, (
          SELECT count(barcode) from ${ETN('stocks')} natural join ${ETN('stocks_view_borrowed')}
          Where book_number=${ETN('titles')}.book_number and deprecated=1 and borrowed=1
        ) deprecated_and_borrowed from ${ETN('titles')}`
      )

      console.log('> Update dataver information.')
      await this.connection.queryAsync(
        'INSERT into ??(dataver) values(?)',
        [ tableInfo.name('dataver_journal'), 2 ]
      )
      console.log('Additional views added.')

      this.old_dataver = 2
    }
    if(this.old_dataver < Math.min(this.target_dataver, 3)) {
      console.log('Migration: 2 -> 3')

      console.log(`> Creating view ${tableInfo.name('users_view_stats')}`)
      await this.connection.queryAsync(
        `CREATE VIEW ${ETN('users_view_stats')} as
        SELECT username, (
          SELECT count(uuid) from ${ETN('borrows')}
          Where username=${ETN('users')}.username
        ) borrows, (
          SELECT count(uuid) from ${ETN('borrows')}
          Where username=${ETN('users')}.username and returned=0
        ) active_borrows, (
          SELECT count(uuid) from ${ETN('borrows')}
          Where username=${ETN('users')}.username and returned=1 and return_time > due_time
        ) overdue_records from ${ETN('users')}`
      )

      console.log('> Update dataver information.')
      await this.connection.queryAsync(
        'INSERT into ??(dataver) values(?)',
        [ tableInfo.name('dataver_journal'), 3 ]
      )
      console.log('Additional views added.')

      this.old_dataver = 3
    }
  }

  async __ensureRoot() {
    const rootUsers = await this.connection.queryAsync(
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
    const rootUserDict = EntityUtils.toStoredDict(newRootUser)
    const clause = SqlClause.insertFromDict('users', rootUserDict)
    console.log("> Creating root user.")
    await this.connection.queryAsync(clause)
    console.log('Root user successfully created. Please save the root password since it cannot be accessed later.')
    console.log('#################################')
    console.log('#  ', rootPassword)
    console.log('#################################')
    console.log('For security, please change password immediately after logging into the root user.')
  }
}
