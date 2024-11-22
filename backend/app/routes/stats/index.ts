import { Express } from 'express'
import { ApiHandlerWrap } from '../../context/ApiHandlerWrap'
import { gatherContextAsync } from '../../context/RequestContext'
import dbManager from '../../database/dbManager'
import tableInfo, { TableOrViewName } from '../../database/tableInfo'
import { SqlEscape } from '../../database/SqlEscape'
import { show_success } from '../../api-protocol/JsonResponse'
import { UserRole } from '@library-management/common/entity/user/role'


export default function routeStats(app: Express) {

  app.post('/api/stats', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await gatherContextAsync(req)

    function ETN(id: TableOrViewName) {
      return SqlEscape.escapeId(tableInfo.name(id))
    }

    await dbManager.withConnectionAsync(async db => {
      const title_count: number = (await db.queryAsync(`
        SELECT count(*) from ${ETN('titles')}
      `, [], true))[0][0]

      const stock_count: number = (await db.queryAsync(`
        SELECT count(*) from ${ETN('stocks')}
      `, [], true))[0][0]
      
      const borrowed_title_count: number = (await db.queryAsync(`
        SELECT count(*) from ${ETN('titles_view_stats')} Where borrowed > 0
      `, [], true))[0][0]

      const borrowed_stock_count: number = (await db.queryAsync(`
        SELECT count(*) from ${ETN('stocks_view_borrowed')} Where borrowed = 1
      `, [], true))[0][0]

      const users_count: number = (await db.queryAsync(`
        SELECT count(*) from ${ETN('users')} Where enabled=1 and role<>${SqlEscape.escape(UserRole.Root)}
      `, [], true))[0][0]

      const to_purchase_count: number = (await db.queryAsync(`
        SELECT sum(to_purchase_amount) from ${ETN('titles')}
      `, [], true))[0][0]

      const to_purchase_price: number = (await db.queryAsync(`
        SELECT sum(to_purchase_amount * price_milliunit) from ${ETN('titles')}
      `, [], true))[0][0]

      const deprecated_count: number = (await db.queryAsync(`
        SELECT count(*) from ${ETN('stocks')} Where deprecated=1
      `, [], true))[0][0]

      show_success(res, {
        title_count, stock_count, borrowed_title_count, borrowed_stock_count, users_count,
        ...(context.user && {
          active_borrows: context.user.active_borrows,
          borrows: context.user.borrows,
          overdue_borrows: context.user.overdue_borrows
        }),
        ...(context.canManageBooks() && {
          to_purchase_count,
          to_purchase_price,
          deprecated_count,
        })
      })
    })
  }))

}
