import { Express, Request, Response } from 'express'
import { ApiHandlerWrap } from '../../context/ApiHandlerWrap'
import { gatherContextAsync } from '../../context/RequestContext'
import { RandomToken } from '@library-management/common/crypto/RandomToken'
import dbManager from '../../database/dbManager'
import { joinPresets, SqlClause } from '../../database/SqlClause'
import { show_result, show_success } from '../../api-protocol/JsonResponse'
import { Validation } from '@library-management/common/entity/Validation'
import { StockValidation } from '@library-management/common/entity/stock/validation'
import Title from '@library-management/common/entity/title'
import Stock from '@library-management/common/entity/stock'
import NotFoundError from '@library-management/common/error/entity/NotFoundError'
import { EntityUtils } from '@library-management/common/entity/EntityUtils'
import AlreadyExistsError from '@library-management/common/error/entity/AlreadyExistsError'
import { SqlEscape } from '../../database/SqlEscape'
import BadSortingError from '@library-management/common/error/entity/BadSortingError'
import tableInfo from '../../database/tableInfo'

async function getContextAsync(req: Request) {
  const context = await gatherContextAsync(req)
  context.checkCanManageBooks_()
  return context
}

export default function routeStockManage(app: Express) {

  app.post('/api/stock/manage/generate-barcode', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await gatherContextAsync(req) // Skip auth
    
    await dbManager.withAtomicAsync(async db => {
      while(true) {
        const barcode = RandomToken.barcode()
        const count = await db.queryCountAsync(SqlClause.selectAnythingWhereDict('stocks', {
          barcode
        }))
        if(count == 0) {
          show_success(res, barcode)
          break
        }
      }
    })
  }))

  app.post('/api/stock/manage/list', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await getContextAsync(req)
    const curTime = Math.floor((+new Date())/1000)

    const { book_number, barcode_prefix, deprecated, borrowed, pn, rn, sort_by, sort_dir } = Validation.getApiInputs_(req.body, {
      book_number: [Validation.validateIsStr_],
      barcode_prefix: [Validation.validateIsStr_],
      deprecated: [(k, v) => Validation.validateIsSet_(k, [false, true], v)],
      borrowed: [(k, v) => Validation.validateIsSet_(k, ['none', 'normal', 'overdue'], v)],
      ...Validation.paginationInputs,
      ...Validation.sortingInputs,
    })

    await dbManager.withAtomicAsync(async db => {
      const conditions = [
        ...(book_number ? [
          `book_number=${SqlEscape.escape(book_number)}`
        ] : []),
        ...(barcode_prefix ? [
          `barcode like ${SqlEscape.escapeLikeStartsWith(barcode_prefix)}`
        ] : []),
        ...(deprecated ? [
          SqlClause.orCondition(deprecated.map((item: boolean) => item ? (
            `deprecated=1`
          ) : (
            `deprecated=0`
          )))
        ] : []),
        ...(borrowed ? [
          SqlClause.orCondition(borrowed.map((item: string) => ({
            none: 'borrowed=0',
            normal: `borrowed=1 and borrowed_due>=${SqlEscape.escape(curTime)}`,
            overdue: `borrowed=1 and borrowed_due<${SqlEscape.escape(curTime)}`
          }[item])))
        ] : [])
      ]
      const whereClause = SqlClause.whereClauseFromAnd(conditions)
      const orderClause = SqlClause.sortingClause(sort_by, sort_dir)
      const limitClause = SqlClause.paginationClause(pn, rn)
      const sql = `${SqlClause.selectAnything(joinPresets.stocks_ext)} ${whereClause} ${orderClause}`

      try {
        const stocks = Stock.fromExtDicts(await db.queryAsync(`${sql} ${limitClause}`))
        const count = await db.queryCountAsync(sql)

        show_success(res, {
          count,
          window: stocks.map(stock => EntityUtils.toDisplayDict(stock, true))
        })
      } catch(err) {
        db.sqlErrorRethrow_(err, {
          ER_BAD_FIELD_ERROR: () => new BadSortingError(sort_by)
        })
      }
    })
  }))

  app.post('/api/stock/manage/enroll', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await getContextAsync(req)

    const { book_number, barcode, decrease_to_purchase } = Validation.getApiInputs_(req.body, {
      book_number: (k, v) => StockValidation.validateBookNumber_(v),
      barcode: (k, v) => StockValidation.validateBarcode_(v),
      decrease_to_purchase: [Validation.validateIsBool_]
    })

    await dbManager.withAtomicAsync(async db => {
      const stock = new Stock(
        book_number, barcode,
        false, ''
      )
      
      try {
        await db.queryAsync(
          SqlClause.insertFromDict('stocks', EntityUtils.toStoredDict(stock))
        )
      } catch(err) {
        db.sqlErrorRethrow_(err, {
          'ER_NO_REFERENCED_ROW_2': () => new NotFoundError(book_number),
          'ER_DUP_ENTRY': () => new AlreadyExistsError(barcode)
        })
      }

      if(decrease_to_purchase) {
        await db.queryAsync(`UPDATE ${SqlEscape.escapeId(tableInfo.name('titles'))} set to_purchase_amount=greatest(to_purchase_amount-1,0) Where book_number=${SqlEscape.escape(book_number)}`)
      }

      const newStock = Stock.fromExtDict(await db.queryOneAsync(SqlClause.selectAnythingWhereDict(
        joinPresets.stocks_ext, {
          barcode
        }
      )))

      show_success(res, EntityUtils.toDisplayDict(newStock, true))
    })
  }))

  app.post('/api/stock/manage/info', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await getContextAsync(req)

    const { barcode } = Validation.getApiInputs_(req.body, {
      barcode: (k, v) => StockValidation.validateBarcode_(v)
    })

    await dbManager.withAtomicAsync(async db => {
      const stock = Stock.fromExtDict(await db.queryOneAsync(SqlClause.selectAnythingWhereDict(
        joinPresets.stocks_ext, { barcode }
      )))
      if(!stock) {
        throw new NotFoundError(barcode)
      }

      show_success(res, EntityUtils.toDisplayDict(stock, true))
    })
  }))

  app.post('/api/stock/manage/set-notes', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await getContextAsync(req)

    await dbManager.withAtomicAsync(async db => {
      const { barcode, stock_notes } = Validation.getApiInputs_(req.body, {
        barcode: (k, v) => StockValidation.validateBarcode_(v),
        stock_notes: (k, v) => StockValidation.validateNotes_(v)
      })

      const stock = Stock.fromExtDict(await db.queryOneAsync(SqlClause.selectAnythingWhereDict(
        joinPresets.stocks_ext, { barcode }
      )))
      if(!stock) {
        throw new NotFoundError(barcode)
      }

      stock.stock_notes = stock_notes
      stock.validate_()

      await db.queryAsync(SqlClause.updateAnythingFromDictWhereDict('stocks',
        EntityUtils.toStoredDict(stock),
        { barcode }
      ))

      show_success(res, EntityUtils.toDisplayDict(stock, true))
    })
  }))

  async function apiSetDeprecated(req: Request, res: Response, flag: boolean) {
    const context = await getContextAsync(req)

    const { barcode } = Validation.getApiInputs_(req.body, {
      barcode: (k, v) => StockValidation.validateBarcode_(v),
    })

    await dbManager.withAtomicAsync(async db => {
      const stock = Stock.fromExtDict(await db.queryOneAsync(SqlClause.selectAnythingWhereDict(
        joinPresets.stocks_ext, { barcode }
      )))
      if(!stock) {
        throw new NotFoundError(barcode)
      }

      stock.deprecated = flag
      stock.validate_()

      await db.queryAsync(SqlClause.updateAnythingFromDictWhereDict('stocks',
        EntityUtils.toStoredDict(stock),
        { barcode }
      ))

      show_success(res, EntityUtils.toDisplayDict(stock, true))
    })
  }

  app.post('/api/stock/manage/deprecate', ApiHandlerWrap.wrap(async (req, res) => {
    await apiSetDeprecated(req, res, true)
  }))
  app.post('/api/stock/manage/revive', ApiHandlerWrap.wrap(async (req, res) => {
    await apiSetDeprecated(req, res, false)
  }))

  app.post('/api/stock/manage/delete', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await getContextAsync(req)

    const { barcode } = Validation.getApiInputs_(req.body, {
      barcode: (k, v) => StockValidation.validateBarcode_(v),
    })

    await dbManager.withAtomicAsync(async db => {
      const stock = Stock.fromExtDict(await db.queryOneAsync(SqlClause.selectAnythingWhereDict(
        joinPresets.stocks_ext, { barcode }
      )))
      if(!stock) {
        throw new NotFoundError(barcode)
      }

      await db.queryAsync(SqlClause.deleteAnythingWhereDict('stocks',
        { barcode }
      ))

      show_success(res, EntityUtils.toDisplayDict(stock, true))
    })
  }))
}
