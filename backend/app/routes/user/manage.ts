import { Express } from "express"
import { ApiHandlerWrap } from "../../context/ApiHandlerWrap"
import { gatherContextAsync } from "../../context/RequestContext"
import { Validation } from "@library-management/common/entity/Validation"
import { SqlEscape } from "../../database/SqlEscape"
import { SqlClause } from "../../database/SqlClause"
import dbManager from "../../database/dbManager"
import { EntityUtils } from "@library-management/common/entity/EntityUtils"
import NotFoundError from "@library-management/common/error/entity/NotFoundError"
import AlreadyExistsError from "@library-management/common/error/entity/AlreadyExistsError"
import User from "@library-management/common/entity/user"
import { show_success } from "../../api-protocol/JsonResponse"
import { UserValidation } from "@library-management/common/entity/user/validation"
import { PasswordHash } from "../../crypto/PasswordHash"
import FieldInvalidError from "@library-management/common/error/validation/FieldInvalidError"

export default function routeUserManage(app: Express) {
  app.get('/api/user/manage/list', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await gatherContextAsync(req)
    context.checkCanManageUsers_()

    let { search_key, roles, pn, rn } = Validation.getApiInputs_(req.body, {
      search_key: [(k, v) => Validation.validateIsStr_(k, v)],
      roles: [(k, v) => Validation.validateIsListOf_(k, (k, v) => UserValidation.validateRole_(v), v)],
      ...Validation.paginationInputs
    })
  
    const whereClause = SqlClause.whereClauseFromAnd([
      ...(search_key ? [
        `username like ${SqlEscape.escapeLikeContains(search_key)} or display_name like ${SqlEscape.escapeLikeContains(search_key)}`
      ] : []),
      ...(roles ? [
        SqlClause.containsCondition('role', roles as string[])
      ] : [])
    ])
    const limitClause = SqlClause.paginationClause(pn, rn)

    let users = await dbManager.queryEntitiesAsync(
      User,
      SqlClause.selectAnything('users') + ' ' + whereClause + ' ' + limitClause
    )
    users = users.filter(user => {
      return context.canManipulateRole(user.role)
    })

    show_success(res, users.map(user => {
      return EntityUtils.entityToSanitizedDict(user, true)
    }))
  }))

  app.get('/api/user/manage/info', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await gatherContextAsync(req)
    context.checkCanManageUsers_()

    let { username } = Validation.getApiInputs_(req.body, {
      username: (k, v) => UserValidation.validateUsername_(v),
    })

    const user = await dbManager.queryEntityAsync(
      User,
      SqlClause.selectAnythingWhereDict('users', {
        username: username
      })
    )
    if(!user) {
      throw new NotFoundError(username)
    }
    context.checkCanManipulateRole_(user.role)

    show_success(res, EntityUtils.entityToSanitizedDict(user, true))
  }))

  app.post('/api/user/manage/update', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await gatherContextAsync(req)
    context.checkCanManageUsers_()

    let { old_username } = Validation.getApiInputs_(req.body, {
      old_username: [(k, v) => Validation.validateIsStr_(k, v)],
    })
    let { old_username: _u, session: _s, ...rest } = req.body
    const user = await (async () => {
      if(old_username) {
        let user = await dbManager.queryEntityAsync(
          User,
          SqlClause.selectAnythingWhereDict('users', { username: old_username })
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
    const modifiedUser = EntityUtils.entityFromDict(user, rest)
    context.checkCanManipulateRole_(modifiedUser.role)

    if(old_username) {
      await dbManager.queryAsync(
        SqlClause.updateAnythingFromDictWhereDict('users',
          EntityUtils.entityToStoredDict(modifiedUser),
          { username: old_username }
        )
      )
    } else {
      const origUser = await dbManager.queryEntityAsync(
        User,
        SqlClause.selectAnythingWhereDict('users', { username: modifiedUser.username })
      )
      if(origUser) {
        throw new AlreadyExistsError(origUser.username)
      }
      await dbManager.queryAsync(
        SqlClause.insertFromDict('users',
          EntityUtils.entityToStoredDict(modifiedUser)
        )
      )
    }

    show_success(res, EntityUtils.entityToSanitizedDict(modifiedUser, true))
  }))

  app.post('/api/user/manage/delete', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await gatherContextAsync(req)
    context.checkCanManageUsers_()

    let { old_username } = Validation.getApiInputs_(req.body, {
      old_username: (k, v) => Validation.validateIsStr_(k, v),
    })
    let user = await dbManager.queryEntityAsync(
      User,
      SqlClause.selectAnythingWhereDict('users', { username: old_username })
    )
    if(!user) {
      throw new NotFoundError(old_username)
    }
    context.checkCanManipulateRole_(user.role)

    await dbManager.queryAsync(
      SqlClause.deleteAnythingWhereDict('users', {
        username: user.username
      })
    )
    show_success(res, EntityUtils.entityToSanitizedDict(user, true))
  }))
}
