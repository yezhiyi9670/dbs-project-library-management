import { Express, Request, Response } from 'express'
import routeBorrowManage from './manage'
import { ApiHandlerWrap } from '../../context/ApiHandlerWrap'
import { gatherContextAsync } from '../../context/RequestContext'
import { Validation } from '@library-management/common/entity/Validation'
import Borrow from '@library-management/common/entity/borrow'
import { BorrowValidation } from '@library-management/common/entity/borrow/validation'
import Stock from '@library-management/common/entity/stock'
import dbManager from '../../database/dbManager'
import { joinPresets, SqlClause } from '../../database/SqlClause'
import NotFoundError from '@library-management/common/error/entity/NotFoundError'
import AlreadyBorrowedError from '@library-management/common/error/borrow/AlreadyBorrowedError'
import StockDeprecatedError from '@library-management/common/error/borrow/StockDeprecatedError'
import NotBorrowedByYouError from '@library-management/common/error/borrow/NotBorrowedByYouError'
import AlreadyOverdueError from '@library-management/common/error/borrow/AlreadyOverdueError'
import MaxBorrowReachedError from '@library-management/common/error/borrow/MaxBorrowReachedError'
import NotOnLibraryTerminalError from '@library-management/common/error/borrow/NotOnLibraryTerminalError'
import globalConfig from '../../config/globalConfig'
import { EntityUtils } from '@library-management/common/entity/EntityUtils'
import AlreadyExistsError from '@library-management/common/error/entity/AlreadyExistsError'
import { show_result, show_success } from '../../api-protocol/JsonResponse'
import { RandomToken } from '@library-management/common/crypto/RandomToken'
import { SqlEscape } from '../../database/SqlEscape'
import User from '@library-management/common/entity/user'
import { PasswordHash } from '../../crypto/PasswordHash'
import BadSortingError from '@library-management/common/error/entity/BadSortingError'

export async function handleBorrowList(req: Request, res: Response, isAdmin: boolean) {
  const curTime = Math.floor((+new Date()) / 1000)
  const context = await gatherContextAsync(req)
  context.checkLoggedIn_()
  if(isAdmin) {
    context.checkCanManageBooks_()
  }
  
  const { book_numbers, barcodes, returned, overdue, users, pn, rn, sort_by, sort_dir } = Validation.getApiInputs_(req.body, {
    book_numbers: [(k, v) => Validation.validateIsListOf_(k, Validation.validateIsStr_, v)],
    barcodes: [(k, v) => Validation.validateIsListOf_(k, Validation.validateIsStr_, v)],
    returned: [(k, v) => Validation.validateIsSet_(k, [ false, true ], v)],
    overdue: [(k, v) => Validation.validateIsSet_(k, [ false, true ], v)],
    users: [(k, v) => Validation.validateIsListOf_(k, Validation.validateIsStr_, v)],
    ...Validation.paginationInputs,
    ...Validation.sortingInputs,
  })

  await dbManager.withAtomicAsync(async db => {
    const conditions = [
      ...(book_numbers ? [
        SqlClause.orCondition(book_numbers.map((item: string) => (
          `book_number=${SqlEscape.escape(item)}`
        )))
      ] : []),
      ...(barcodes ? [
        SqlClause.orCondition(barcodes.map((item: string) => (
          `barcode=${SqlEscape.escape(item)}`
        )))
      ] : []),
      ...(returned ? [
        SqlClause.orCondition(returned.map((item: boolean) => item ? (
          `returned=1`
        ) : (
          `returned=0`
        )))
      ] : []),
      ...(overdue ? [
        SqlClause.orCondition(overdue.map((item: boolean) => item ? (
          `overdue=1`
        ) : (
          `overdue=0`
        )))
      ] : []),
      ...(users ? [
        SqlClause.orCondition(users.map((item: string) => (
          `username=${SqlEscape.escape(item)}`
        )))
      ] : []),
      ...(!isAdmin ? [
        `username=${SqlEscape.escape(context.user!.username)}`
      ] : [])
    ]
    const whereClause = SqlClause.whereClauseFromAnd(conditions)
    const orderClause = SqlClause.sortingClause(sort_by, sort_dir)
    const sql = `${SqlClause.selectAnything(joinPresets.borrows_ext)} ${whereClause} ${orderClause}`
    const limitClause = SqlClause.paginationClause(pn, rn)

    try {
      const borrows = Borrow.fromExtDicts(await db.queryAsync(`${sql} ${limitClause}`))
      const count = await db.queryCountAsync(sql)
      show_success(res, {
        count,
        window: borrows.map(borrow => EntityUtils.toDisplayDict(borrow, isAdmin))
      })
    } catch(err) {
      db.sqlErrorRethrow_(err, {
        ER_BAD_FIELD_ERROR: () => new BadSortingError(sort_by)
      })
    }
  })
}

export async function handleBorrow(req: Request, res: Response, op: 'borrow' | 'renew' | 'return', isAdmin: boolean) {
  const curTime = Math.floor((+new Date()) / 1000)
  const context = await gatherContextAsync(req)
  context.checkLoggedIn_()
  if(isAdmin) {
    context.checkCanManageBooks_()
  }

  const { barcode, __secret, username: __username } = Validation.getApiInputs_(req.body, {
    barcode: (k, v) => BorrowValidation.validateBarcode_(v),
    __secret: [Validation.validateIsStr_],
    ...(isAdmin && {
      username: (k, v) => BorrowValidation.validateUsername_(v)
    })
  })

  if(!isAdmin) {
    const secretHash = globalConfig.librarySecretHash()
    if(secretHash && !PasswordHash.verify(__secret, secretHash)) {
      throw new NotOnLibraryTerminalError()
    }
  }

  await dbManager.withAtomicAsync(async db => {
    const username = isAdmin ? __username : context.user!.username
  
    if(isAdmin){
      const user = await db.queryEntityAsync(
        [User.withDerivatives],
        SqlClause.selectAnythingWhereDict(joinPresets.users, { username })
      )
      if(!user) {
        throw new NotFoundError(username)
      }
      context.checkCanManipulateRole_(user.role)
    } else {
      if(op == 'borrow' && context.user!.active_borrows >= globalConfig.maxBorrowCount()) {
        throw new MaxBorrowReachedError()
      }
    }

    // Share the stock info. We need to check if it exists.
    const stock = await db.queryEntityAsync(
      [Stock.withDerivative],
      SqlClause.selectAnythingWhereDict(joinPresets.stocks, {
        barcode: barcode
      })
    )
    if(!stock) {
      throw new NotFoundError(barcode)
    }

    if(op == 'borrow') {
      if(stock.borrowed) {
        throw new AlreadyBorrowedError(barcode)
      }
      if(stock.deprecated) {
        throw new StockDeprecatedError(barcode)
      }
  
      const borrow = new Borrow(
        RandomToken.uuid(), barcode, username,
        curTime, curTime + globalConfig.maxBorrowTime(), false, 0, ''
      )
      try {
        await db.queryAsync(SqlClause.insertFromDict('borrows',
          EntityUtils.toStoredDict(borrow)
        ))
      } catch(err) {
        db.sqlErrorRethrow_(err, {
          'ER_NO_REFERENCED_ROW_2': () => new NotFoundError(username),
          'ER_DUP_ENTRY': () => new AlreadyExistsError(borrow.uuid)
        })
      }
  
      const newBorrow = Borrow.fromExtDict(await db.queryOneAsync(SqlClause.selectAnythingWhereDict(joinPresets.borrows_ext, {
        uuid: borrow.uuid
      })))
  
      show_success(res, EntityUtils.toDisplayDict(newBorrow, false))
    } else {
      const borrow = Borrow.fromExtDict(await db.queryOneAsync(SqlClause.selectAnythingWhereDict(
        joinPresets.borrows_ext, {
          barcode,
          username: username,
          returned: false
        }
      )))
      if(!borrow) {
        throw new NotBorrowedByYouError(barcode)
      }

      if(op == 'renew') {
        if(curTime > borrow.due_time && !isAdmin) {
          throw new AlreadyOverdueError(barcode, borrow.due_time)
        }
    
        borrow.due_time = curTime + globalConfig.maxBorrowTime()
        await db.queryAsync(SqlClause.updateAnythingFromDictWhereDict('borrows', EntityUtils.toStoredDict(borrow), {
          uuid: borrow.uuid
        }))
    
        show_success(res, EntityUtils.toDisplayDict(borrow, false))
      } else if(op == 'return') {
        borrow.return_time = curTime
        borrow.returned = true
        await db.queryAsync(SqlClause.updateAnythingFromDictWhereDict('borrows', EntityUtils.toStoredDict(borrow), {
          uuid: borrow.uuid
        }))

        show_success(res, EntityUtils.toDisplayDict(borrow, false))
      } else {
        throw new Error('exh check')
      }
    }
  })
}

export default function routeBorrow(app: Express) {
  routeBorrowManage(app)

  app.post('/api/borrow/my', ApiHandlerWrap.wrap(async (req, res) => {
    await handleBorrowList(req, res, false)
  }))

  app.post('/api/borrow/borrow', ApiHandlerWrap.wrap(async (req, res) => {
    await handleBorrow(req, res, 'borrow', false)
  }))

  app.post('/api/borrow/renew', ApiHandlerWrap.wrap(async (req, res) => {
    await handleBorrow(req, res, 'renew', false)
  }))

  app.post('/api/borrow/return', ApiHandlerWrap.wrap(async (req, res) => {
    await handleBorrow(req, res, 'return', false)
  }))

  app.post('/api/borrow/check', ApiHandlerWrap.wrap(async (req, res) => {
    const curTime = Math.floor((+new Date()) / 1000)
    const context = await gatherContextAsync(req)

    const { barcode } = Validation.getApiInputs_(req.body, {
      barcode: (k, v) => BorrowValidation.validateBarcode_(v)
    })

    await dbManager.withAtomicAsync(async db => {
      const stock = Stock.fromExtDict(await db.queryOneAsync(
        SqlClause.selectAnythingWhereDict(joinPresets.stocks_ext, {
          barcode: barcode
        })
      ))
      if(!stock) {
        throw new NotFoundError(barcode)
      }
      stock.__hasDerivatives = false

      const borrowed = stock.borrowed
      const borrowed_due = borrowed ? stock.borrowed_due : 0
      const borrowed_by_you = borrowed && context.user && stock.borrowed_by == context.user.username
      const deprecated = stock.deprecated

      show_success(res, {
        borrowed, borrowed_due, borrowed_by_you, deprecated,
        $stock: EntityUtils.toDisplayDict(stock, false)
      })
    })
  }))
}
