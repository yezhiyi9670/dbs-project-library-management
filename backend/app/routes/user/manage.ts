import { Express, Request } from "express"
import { ApiHandlerWrap } from "../../context/ApiHandlerWrap"
import { gatherContextAsync } from "../../context/RequestContext"
import { Validation } from "@library-management/common/entity/Validation"
import { SqlEscape } from "../../database/SqlEscape"
import { joinPresets, SqlClause } from "../../database/SqlClause"
import dbManager from "../../database/dbManager"
import { EntityUtils } from "@library-management/common/entity/EntityUtils"
import NotFoundError from "@library-management/common/error/entity/NotFoundError"
import AlreadyExistsError from "@library-management/common/error/entity/AlreadyExistsError"
import User from "@library-management/common/entity/user"
import { show_success } from "../../api-protocol/JsonResponse"
import { UserValidation } from "@library-management/common/entity/user/validation"
import { PasswordHash } from "../../crypto/PasswordHash"
import FieldInvalidError from "@library-management/common/error/validation/FieldInvalidError"
import mysql from 'mysql'
import BadSortingError from "@library-management/common/error/entity/BadSortingError"

async function getContextAsync(req: Request) {
  const context = await gatherContextAsync(req)
  context.checkCanManageUsers_()
  return context
}

export default function routeUserManage(app: Express) {
  app.post('/api/user/manage/list', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await getContextAsync(req)

    let { search_key, username, overdue_min, roles, pn, rn, sort_by, sort_dir } = Validation.getApiInputs_(req.body, {
      search_key: [Validation.validateIsStr_],
      username: [Validation.validateIsStr_],
      overdue_min: [Validation.validateIsInt_],
      roles: [(k, v) => Validation.validateIsListOf_(k, (k, v) => UserValidation.validateRole_(v), v)],
      ...Validation.paginationInputs,
      ...Validation.sortingInputs,
    })
    
    await dbManager.withAtomicAsync(async db => {
      const whereClause = SqlClause.whereClauseFromAnd([
        ...(search_key ? [
          `username like ${SqlEscape.escapeLikeContains(search_key)} or display_name like ${SqlEscape.escapeLikeContains(search_key)}`
        ] : []),
        ...(username ? [
          `username = ${SqlEscape.escape(username)}`
        ] : []),
        ...(roles ? [
          SqlClause.containsCondition('role', roles as string[])
        ] : []),
        ...((overdue_min != null) ? [
          `overdue_records>=${SqlEscape.escape(overdue_min)}`
        ] : []),
        SqlClause.containsCondition('role', context.manipulatableRoles())
      ])
      const limitClause = SqlClause.paginationClause(pn, rn)
      const orderClause = SqlClause.sortingClause(sort_by, sort_dir)
      const sql = `${SqlClause.selectAnyUser()} ${whereClause} ${orderClause}`

      try {
        const users = await db.queryEntitiesAsync([User.withDerivatives], `${sql} ${limitClause}`)
        const count = await db.queryCountAsync(sql)

        show_success(res, {
          count,
          window: users.map(user => {
            return EntityUtils.toDisplayDict(user, true)
          })
        })
      } catch(err) {
        db.sqlErrorRethrow_(err, {
          ER_BAD_FIELD_ERROR: () => new BadSortingError(sort_by)
        })
      }
    })
  }))

  app.post('/api/user/manage/info', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await getContextAsync(req)

    let { username } = Validation.getApiInputs_(req.body, {
      username: (k, v) => UserValidation.validateUsername_(v),
    })

    await dbManager.withAtomicAsync(async db => {
      const user = await db.queryEntityAsync(
        [User.withDerivatives],
        SqlClause.selectAnyUserWhereDict({
          username: username
        })
      )
      if(!user) {
        throw new NotFoundError(username)
      }
      context.checkCanManipulateRole_(user.role)

      show_success(res, EntityUtils.toDisplayDict(user, true))
    })
  }))

  app.post('/api/user/manage/update', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await getContextAsync(req)

    let { old_username, __rest: rest } = Validation.getApiInputs_(req.body, {
      old_username: [(k, v) => Validation.validateIsStr_(k, v)],
    })

    await dbManager.withAtomicAsync(async db => {
      const origUser = await (async () => {
        if(old_username) {
          let user = await db.queryEntityAsync(
            [User.withDerivatives],
            SqlClause.selectAnyUserWhereDict({ username: old_username })
          )
          if(!user) {
            throw new NotFoundError(old_username)
          }
          context.checkCanManipulateRole_(user.role)
          return user
        } else {
          return new User()
        }
      })()

      if('password' in rest) {
        if(rest['password']) {
          rest['password'] = PasswordHash.hash(rest['password'])
        } else {
          delete rest['password']
        }
      }
      if(!('password' in rest) && !old_username) {
        throw new FieldInvalidError('password', '')
      }
      const modifiedUser = EntityUtils.fromDict(origUser, rest)
      context.checkCanManipulateRole_(modifiedUser.role)

      try {
        if(old_username) {
          await db.queryAsync(
            SqlClause.updateAnythingFromDictWhereDict('users',
              EntityUtils.toStoredDict(modifiedUser),
              { username: old_username }
            )
          )
        } else {
          await db.queryAsync(
            SqlClause.insertFromDict('users',
              EntityUtils.toStoredDict(modifiedUser)
            )
          )
        }
      } catch(err) {
        db.sqlErrorRethrow_(err, {
          'ER_DUP_ENTRY': () => new AlreadyExistsError(modifiedUser.username)
        })
      }

      show_success(res, EntityUtils.toDisplayDict(modifiedUser, true))
    })
  }))

  app.post('/api/user/manage/delete', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await getContextAsync(req)

    await dbManager.withAtomicAsync(async db => {
      let { old_username } = Validation.getApiInputs_(req.body, {
        old_username: (k, v) => Validation.validateIsStr_(k, v),
      })
      let origUser = await db.queryEntityAsync(
        [User.withDerivatives],
        SqlClause.selectAnyUserWhereDict({ username: old_username })
      )
      if(!origUser) {
        throw new NotFoundError(old_username)
      }
      context.checkCanManipulateRole_(origUser.role)

      await db.queryAsync(
        SqlClause.deleteAnythingWhereDict('users', {
          username: origUser.username
        })
      )
      show_success(res, EntityUtils.toDisplayDict(origUser, true))
    })
  }))
}
