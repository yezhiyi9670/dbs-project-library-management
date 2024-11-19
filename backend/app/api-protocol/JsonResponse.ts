import { Response } from 'express'

export function show_json(res: Response, errorCode: string | null, msg: string, data?: unknown) {
  res.json({
    errorCode,
    msg,
    data,
  })
}
