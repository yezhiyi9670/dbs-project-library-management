import { Express, Request } from 'express'
import { gatherContextAsync } from '../../context/RequestContext'
import { ApiHandlerWrap } from '../../context/ApiHandlerWrap'
import { handleBorrow, handleBorrowList } from '.'
import { BorrowValidation } from '@library-management/common/entity/borrow/validation'
import { Validation } from '@library-management/common/entity/Validation'
import dbManager from '../../database/dbManager'
import Borrow from '@library-management/common/entity/borrow'
import { joinPresets, SqlClause } from '../../database/SqlClause'
import NotFoundError from '@library-management/common/error/entity/NotFoundError'
import { show_success } from '../../api-protocol/JsonResponse'
import { EntityUtils } from '@library-management/common/entity/EntityUtils'

async function getContextAsync(req: Request) {
  const context = await gatherContextAsync(req)
  context.checkCanManageBooks_()
  return context
}

export default function routeBorrowManage(app: Express) {

  app.post('/api/borrow/manage/list', ApiHandlerWrap.wrap(async (req, res) => {
    await handleBorrowList(req, res, true)
  }))

  app.post('/api/borrow/manage/info', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await getContextAsync(req)

    const { uuid } = Validation.getApiInputs_(req.body, {
      uuid: (k, v) => BorrowValidation.validateUuid_(v)
    })

    await dbManager.withAtomicAsync(async db => {
      const borrow = Borrow.fromExtDict(await db.queryOneAsync(SqlClause.selectAnythingWhereDict(
        joinPresets.borrows_ext, { uuid }
      )))
      if(!borrow) {
        throw new NotFoundError(uuid)
      }

      show_success(res, EntityUtils.toDisplayDict(borrow, true))
    })
  }))

  app.post('/api/borrow/manage/borrow', ApiHandlerWrap.wrap(async (req, res) => {
    await handleBorrow(req, res, 'borrow', true)
  }))

  app.post('/api/borrow/manage/renew', ApiHandlerWrap.wrap(async (req, res) => {
    await handleBorrow(req, res, 'renew', true)
  }))

  app.post('/api/borrow/manage/return', ApiHandlerWrap.wrap(async (req, res) => {
    await handleBorrow(req, res, 'return', true)
  }))

  app.post('/api/borrow/manage/set-notes', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await getContextAsync(req)

    const { uuid, borrow_notes } = Validation.getApiInputs_(req.body, {
      uuid: (k, v) => BorrowValidation.validateUuid_(v),
      borrow_notes: (k, v) => BorrowValidation.validateNotes_(v)
    })

    await dbManager.withAtomicAsync(async db => {
      const borrow = Borrow.fromExtDict(await db.queryOneAsync(SqlClause.selectAnythingWhereDict(
        joinPresets.borrows_ext, { uuid }
      )))
      if(!borrow) {
        throw new NotFoundError(uuid)
      }

      borrow.borrow_notes = borrow_notes
      borrow.validate_()

      await db.queryAsync(SqlClause.updateAnythingFromDictWhereDict('borrows', EntityUtils.toStoredDict(borrow), {
        uuid: borrow.uuid
      }))
      show_success(res, EntityUtils.toDisplayDict(borrow, true))
    })
  }))

  app.post('/api/borrow/manage/delete', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await getContextAsync(req)

    const { uuid } = Validation.getApiInputs_(req.body, {
      uuid: (k, v) => BorrowValidation.validateUuid_(v),
    })

    await dbManager.withAtomicAsync(async db => {
      const borrow = Borrow.fromExtDict(await db.queryOneAsync(SqlClause.selectAnythingWhereDict(
        joinPresets.borrows_ext, { uuid }
      )))
      if(!borrow) {
        throw new NotFoundError(uuid)
      }

      await db.queryAsync(SqlClause.deleteAnythingWhereDict('borrows', {
        uuid: borrow.uuid
      }))
      show_success(res, EntityUtils.toDisplayDict(borrow, true))
    })
  }))
}
