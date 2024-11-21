import { Express } from 'express'
import { ApiHandlerWrap } from '../../context/ApiHandlerWrap'
import { gatherContextAsync } from '../../context/RequestContext'
import dbManager from '../../database/dbManager'
import tableInfo, { TableOrViewName } from '../../database/tableInfo'
import { SqlEscape } from '../../database/SqlEscape'
import { show_success } from '../../api-protocol/JsonResponse'


export default function routeStats(app: Express) {

  app.get('/api/stats', ApiHandlerWrap.wrap(async (req, res) => {
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

      const to_purchase_count: number = (await db.queryAsync(`
        SELECT sum(to_purchase_amount) from ${ETN('titles')}
      `, [], true))[0][0]

      const to_purchase_price: number = (await db.queryAsync(`
        SELECT sum(to_purchase_amount * price_milliunit) from ${ETN('titles')}
      `, [], true))[0][0]

      show_success(res, {
        title_count, stock_count, borrowed_title_count, borrowed_stock_count,
        ...(context.canManageBooks() && {
          to_purchase_count,
          to_purchase_price
        })
      })
    })
  }))

}
