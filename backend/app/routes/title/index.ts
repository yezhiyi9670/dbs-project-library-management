import { Express } from 'express'
import routeTitleManage from './manage'
import { ApiHandlerWrap } from '../../context/ApiHandlerWrap'
import { gatherContextAsync } from '../../context/RequestContext'
import { Validation } from '@library-management/common/entity/Validation'
import { TitleValidation } from '@library-management/common/entity/title/validation'
import dbManager from '../../database/dbManager'
import Title from '@library-management/common/entity/title'
import { joinPresets, SqlClause } from '../../database/SqlClause'
import NotFoundError from '@library-management/common/error/entity/NotFoundError'
import { show_result, show_success } from '../../api-protocol/JsonResponse'
import { EntityUtils } from '@library-management/common/entity/EntityUtils'
import { StockValidation } from '@library-management/common/entity/stock/validation'
import { SqlEscape } from '../../database/SqlEscape'
import tableInfo from '../../database/tableInfo'
import BadSortingError from '@library-management/common/error/entity/BadSortingError'

export default function routeTitle(app: Express) {
  routeTitleManage(app)

  app.post('/api/title/info', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await gatherContextAsync(req)

    const { book_number } = Validation.getApiInputs_(req.body, {
      book_number: (k, v) => TitleValidation.validateBookNumber_(v)
    })

    await dbManager.withAtomicAsync(async db => {
      const title = await db.queryEntityAsync(
        [Title.withDerivatives],
        SqlClause.selectAnythingWhereDict(joinPresets.titles, { book_number })
      )
      if(!title) {
        throw new NotFoundError(book_number)
      }

      show_success(res, EntityUtils.toDisplayDict(title, context.canManageBooks()))
    })
  }))

  app.post('/api/title/list', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await gatherContextAsync(req)

    let {
      search_key, book_number, barcode, title, author, publisher,
      accessible, year_min, year_max, status, pn, rn, sort_by, sort_dir
    } = Validation.getApiInputs_(req.body, {
      search_key: [Validation.validateIsStr_],
      book_number: [Validation.validateIsStr_],
      barcode: [Validation.validateIsStr_],
      title: [Validation.validateIsStr_],
      author: [Validation.validateIsStr_],
      publisher: [Validation.validateIsStr_],
      accessible: [(k, v) => Validation.validateIsSet_(k, [
        'offline', 'online'
      ], v)],
      year_min: [Validation.validateIsInt_],
      year_max: [Validation.validateIsInt_],
      status: [(k, v) => Validation.validateIsSet_(k, [
        'borrowable', 'borrowed', 'unavailable', 'empty'
      ], v)],
      ...Validation.paginationInputs,
      ...Validation.sortingInputs,
    })
    if(accessible == null) {
      accessible = []
    }

    await dbManager.withAtomicAsync(async db => {
      const conditions = [
        ...(search_key ? [
          `title like ${
            SqlEscape.escapeLikeContains(search_key)
          } or author like ${
            SqlEscape.escapeLikeContains(search_key)
          } or publisher like ${
            SqlEscape.escapeLikeContains(search_key)
          }`
        ] : []),
        ...(book_number ? [
          `book_number=${SqlEscape.escape(book_number)}`
        ] : []),
        ...(barcode ? [
          `book_number in (SELECT book_number from ${
            SqlEscape.escapeId(tableInfo.name('stocks'))
          } Where barcode=${
            SqlEscape.escape(barcode)
          })`
        ] : []),
        ...(title ? [
          `title like ${
            SqlEscape.escapeLikeContains(title)
          }`
        ] : []),
        ...(author ? [
          `author like ${
            SqlEscape.escapeLikeContains(author)
          }`
        ] : []),
        ...(publisher ? [
          `publisher like ${
            SqlEscape.escapeLikeContains(publisher)
          }`
        ] : []),
        ...(accessible.indexOf('offline') != -1 ? [
          `place is not null and place <> ''`
        ] : []),
        ...(accessible.indexOf('online') != -1 ? [
          `url is not null and url <> ''`
        ] : []),
        ...((year_min != null) ? [
          `year >= ${SqlEscape.escape(year_min)}`
        ] : []),
        ...((year_max != null) ? [
          `year <= ${SqlEscape.escape(year_max)}`
        ] : []),
        ...(status ? [
          SqlClause.orCondition(status.map((item: string) => ({
            // Has borrowable book
            borrowable: 'total-borrowed-deprecated+deprecated_and_borrowed>0',
            // Has no borrowable book but has some non-deprecated and borrowed books
            borrowed: 'total-borrowed-deprecated+deprecated_and_borrowed=0 and borrowed-deprecated_and_borrowed>0',
            // Has only deprecated books
            unavailable: 'total-deprecated=0 and deprecated>0',
            // Has no books
            empty: 'total=0'
          }[item])))
        ] : []),
      ]
      const whereClause = SqlClause.whereClauseFromAnd(conditions)
      const limitClause = SqlClause.paginationClause(pn, rn)
      const orderClause = SqlClause.sortingClause(sort_by, sort_dir)
      const sql = `${SqlClause.selectAnything(joinPresets.titles)} ${whereClause} ${orderClause}`

      try {
        const titles = await db.queryEntitiesAsync([Title.withDerivatives], `${sql} ${limitClause}`)
        const count = await db.queryCountAsync(sql)

        show_success(res, {
          count,
          window: titles.map(title => EntityUtils.toDisplayDict(title, context.canManageBooks()))
        })
      } catch(err) {
        db.sqlErrorRethrow_(err, {
          ER_BAD_FIELD_ERROR: () => new BadSortingError(sort_by)
        })
      }
    })
  }))
}
