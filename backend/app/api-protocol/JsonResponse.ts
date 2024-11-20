import { Response } from 'express'
import UserCausedError from '@library-management/common/error/UserCausedError'

export function show_result(res: Response, errorCode: string | null, msg: string, data?: unknown) {
  res.json({
    errorCode,
    msg,
    data,
  })
}

export function show_success(res: Response, data?: unknown) {
  show_result(res, null, 'Success', data)
}

export function show_error(res: Response, err: UserCausedError, data?: unknown) {
  show_result(res, err.id, err.msg, {
    args: err.args,
    further: data
  })
}
