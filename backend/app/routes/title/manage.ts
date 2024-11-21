import { Express, Request } from 'express'
import { ApiHandlerWrap } from '../../context/ApiHandlerWrap'
import { gatherContextAsync } from '../../context/RequestContext'
import { Validation } from '@library-management/common/entity/Validation'
import Title from '@library-management/common/entity/title'
import dbManager from '../../database/dbManager'
import { joinPresets, SqlClause } from '../../database/SqlClause'
import NotFoundError from '@library-management/common/error/entity/NotFoundError'
import { EntityUtils } from '@library-management/common/entity/EntityUtils'
import AlreadyExistsError from '@library-management/common/error/entity/AlreadyExistsError'
import { show_success } from '../../api-protocol/JsonResponse'

async function getContextAsync(req: Request) {
  const context = await gatherContextAsync(req)
  context.checkCanManageBooks_()
  return context
}

export default function routeTitleManage(app: Express) {
  
  app.post('/api/title/manage/update', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await getContextAsync(req)
    
    const { old_book_number, __rest: rest } = Validation.getApiInputs_(req.body, {
      old_book_number: [(k, v) => Validation.validateIsStr_(k, v)]
    })
    
    await dbManager.withAtomicAsync(async db => {
      const origTitle = await (async () => {
        if(old_book_number) {
          const title = await db.queryEntityAsync(
            [Title.withDerivatives],
            SqlClause.selectAnythingWhereDict(joinPresets.titles, { book_number: old_book_number })
          )
          if(!title) {
            throw new NotFoundError(old_book_number)
          }
          return title
        } else {
          return new Title()
        }
      })()

      const modifiedTitle = EntityUtils.fromDict(origTitle, rest)
      
      try {
        if(old_book_number) {
          await db.queryAsync(
            SqlClause.updateAnythingFromDictWhereDict('titles', (
              EntityUtils.toStoredDict(modifiedTitle)
            ), {
              book_number: old_book_number
            })
          )
        } else {
          await db.queryAsync(
            SqlClause.insertFromDict('titles',
              EntityUtils.toStoredDict(modifiedTitle)
            )
          )
        }
      } catch(err) {
        db.sqlErrorRethrow_(err, {
          'ER_DUP_ENTRY': () => new AlreadyExistsError(modifiedTitle.book_number)
        })
      }

      show_success(res, EntityUtils.toDisplayDict(modifiedTitle, true))
    })
  }))

  app.post('/api/title/manage/delete', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await getContextAsync(req)

    const { old_book_number } = Validation.getApiInputs_(req.body, {
      old_book_number: (k, v) => Validation.validateIsStr_(k, v)
    })

    await dbManager.withAtomicAsync(async db => {
      const origTitle = await db.queryEntityAsync(
        [Title.withDerivatives],
        SqlClause.selectAnythingWhereDict(joinPresets.titles, {
          book_number: old_book_number
        })
      )
      if(!origTitle) {
        throw new NotFoundError(old_book_number)
      }

      await db.queryAsync(
        SqlClause.deleteAnythingWhereDict('titles', {
          book_number: old_book_number
        })
      )
      show_success(res, EntityUtils.toDisplayDict(origTitle, true))
    })
  }))

}
