import { Express } from "express"
import routeStatic from "./static"
import { show_json } from "../api-protocol/JsonResponse"
import { BACKEND_VERSION } from '../version'
import globalConfig from "../config/globalConfig"

export default function routeMain(app: Express) {
  routeStatic(app)

  app.get('/api', (res, req) => {
    show_json(req, null, 'Hello world from the backend!', {
      version: BACKEND_VERSION,
      config: {
        cookiePrefix: globalConfig.cookiePrefix(),
        maxBorrowTime: globalConfig.maxBorrowTime(),
        maxBorrowCount: globalConfig.maxBorrowCount(),
        allowPasswordReset: globalConfig.allowPasswordReset()
      }
    })
  })
}
