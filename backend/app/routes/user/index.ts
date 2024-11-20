import { Express } from "express"
import { show_error, show_result, show_success } from "../../api-protocol/JsonResponse"
import { UserValidation } from "@library-management/common/entity/user/validation"
import { UserAuth } from "../../authentication/UserAuth"
import { ApiHandlerWrap } from "../../context/ApiHandlerWrap"
import cookieInfo from "../../context/cookieInfo"
import globalConfig from "../../config/globalConfig"
import { gatherContextAsync } from "../../context/RequestContext"
import { EntityUtils } from "@library-management/common/entity/EntityUtils"
import { Validation } from "@library-management/common/entity/Validation"
import { PasswordHash } from "../../crypto/PasswordHash"
import OldPasswordRequiredError from "@library-management/common/error/authentication/OldPasswordRequiredError"
import dbManager from "../../database/dbManager"
import { SqlClause } from "../../database/SqlClause"
import { SqlEscape } from "../../database/SqlEscape"
import routeUserManage from "./manage"

export default function routeUser(app: Express) {
  routeUserManage(app)

  app.get('/api/user/info', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await gatherContextAsync(req)
    show_success(res,
      EntityUtils.entityToSanitizedDict(context.user, false)
    )
  }))

  app.post('/api/user/logout', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await gatherContextAsync(req)
    let message = ''
    if(context.sessionId == null) {
      message = 'Not logged in.'
    } else {
      UserAuth.logout(context)
      res.clearCookie(cookieInfo.name('session_id'))
      res.clearCookie(cookieInfo.name('session_secret'))
      if(context.user) {
        message = `Goodbye, ${context.user.display_name}!`
      } else {
        message = 'Successfully logged out.'
      }
    }
    show_result(res, null, message, {
      user: null,
      session: null
    })
  }))

  app.post('/api/user/logout-others', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await gatherContextAsync(req)
    context.checkLoggedIn_()

    const whereClause = `Where session<>${SqlEscape.escape(context.sessionId!)} and username=${SqlEscape.escape(context.user!.username)}`
    await dbManager.queryAsync(
      SqlClause.deleteAnything('users_session') + ' ' + whereClause
    )
    show_success(res, {
      session: context.sessionId
    })
  }))

  app.post('/api/user/login', ApiHandlerWrap.wrap(async (req, res) => {
    const { username, password } = Validation.getApiInputs_(req.body, {
      username: (k, v) => UserValidation.validateUsername_(v),
      password: (k, v) => Validation.validateIsStr_(k, v)
    })

    const context = await gatherContextAsync(req)
    if(context.user) {  // Already logged in
      if(context.user.username == username) {
        show_result(res, null, `You have already logged in!`, {
          user: EntityUtils.entityToSanitizedDict(context.user, false),
          session: context.sessionId
        })
        return
      } else {
        UserAuth.logout(context)
        res.clearCookie(cookieInfo.name('session_id'))
        res.clearCookie(cookieInfo.name('session_secret'))
      }
    }

    const [ user, sessionId, sessionSecret ] = await UserAuth.passwordfulLoginAsync(username, password)

    res.cookie(cookieInfo.name('session_id'), sessionId, { maxAge: globalConfig.sessionExpireTime() * 2 * 1000 })
    res.cookie(cookieInfo.name('session_secret'), sessionSecret, { maxAge: globalConfig.sessionExpireTime() * 2 * 1000 })
    show_result(res, null, `Welcome back, ${user.display_name}!`, {
      user: EntityUtils.entityToSanitizedDict(user, false),
      session: sessionId
    })
  }))

  app.post('/api/user/update', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await gatherContextAsync(req)
    context.checkLoggedIn_()

    let { display_name, old_password, email, password } = Validation.getApiInputs_(req.body, {
      display_name: [(k, v) => UserValidation.validateDisplayName_(v)],
      old_password: [(k, v) => Validation.validateIsStr_(k, v)],
      email: [(k, v) => UserValidation.validateEmail_(v)],
      password: [(k, v) => Validation.validateIsStr_(k, v)]
    })

    if(email == context.user!.email) {
      email = null
    }
    let passwordCorrect = false
    if(old_password != null) {
      passwordCorrect = PasswordHash.verify(old_password, context.user!.password)
    }
    if(!passwordCorrect && (email != null || password)) {
      throw new OldPasswordRequiredError(password ? 'password' : 'email')
    }

    const user = context.user!
    if(display_name != null) {
      user.display_name = display_name
    }
    if(email != null) {
      user.email = email
    }
    if(password) {
      user.password = PasswordHash.hash(password)
    }

    await dbManager.queryAsync(
      SqlClause.updateAnythingFromDictWhereDict(
        'users', EntityUtils.entityToStoredDict(user), {
          username: user.username
        }
      )
    )
    show_success(res, EntityUtils.entityToSanitizedDict(user, false))
  }))
}
