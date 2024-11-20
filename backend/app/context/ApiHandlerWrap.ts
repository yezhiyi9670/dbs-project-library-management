import { RequestHandler } from "express";
import { show_error } from "../api-protocol/JsonResponse";
import UserCausedError from "@library-management/common/error/UserCausedError";
import UnknownError from "@library-management/common/error/unknown/UnknownError"
import globalConfig from "../config/globalConfig";

export namespace ApiHandlerWrap {
  export function wrap(handler: RequestHandler): RequestHandler {
    return async (req, res, next) => {
      try {
        const ret = handler(req, res, next)
        if(ret instanceof Promise) {
          await ret
        }
      } catch(err) {
        if(err instanceof UserCausedError) {
          // Shows the user caused error directly.
          show_error(res, err)
        } else {
          let prepared_error = err
          if(err instanceof Error) {
            prepared_error = err.toString()
          }
          show_error(res, new UnknownError(), globalConfig.isDebug() ? prepared_error : null)
        }
      }
    }
  }
}
