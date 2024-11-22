import { Express } from "express"
import routeStatic from "./static"
import { show_error, show_result } from "../api-protocol/JsonResponse"
import { BACKEND_VERSION } from '../version'
import globalConfig from "../config/globalConfig"
import { ApiHandlerWrap } from "../context/ApiHandlerWrap"
import { gatherContextAsync } from "../context/RequestContext"
import { EntityUtils } from "@library-management/common/entity/EntityUtils"
import routeUser from "./user"
import routeTitle from "./title"
import routeStock from "./stock"
import routeBorrow from "./borrow"
import routeStats from "./stats"

export default function routeMain(app: Express) {
  routeStatic(app)
  routeUser(app)
  routeTitle(app)
  routeStock(app)
  routeBorrow(app)
  routeStats(app)

  app.post('/api', ApiHandlerWrap.wrap(async (req, res) => {
    const context = await gatherContextAsync(req)
    show_result(res, null, 'Hello world from the backend!', {
      version: BACKEND_VERSION,
      config: {
        cookiePrefix: globalConfig.cookieNamespace(),
        maxBorrowTime: globalConfig.maxBorrowTime(),
        maxBorrowCount: globalConfig.maxBorrowCount(),
        allowPasswordReset: globalConfig.allowPasswordReset()
      },
      session: context.sessionId,
      user: EntityUtils.toDisplayDict(context.user, false)
    })
  }))
}
