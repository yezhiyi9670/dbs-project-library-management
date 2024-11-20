import express from 'express'
import cookieParser from 'cookie-parser'
import commandLineArgs from 'command-line-args'
import routeMain from './app/routes'
import globalConfig from './app/config/globalConfig'
import dbManager from './app/database/dbManager'
import { Test } from './test/Test'
import { show_error } from './app/api-protocol/JsonResponse'
import ActionNotFoundError from '@library-management/common/error/server/ActionNotFoundError'
import UnknownError from '@library-management/common/error/unknown/UnknownError'
import MalformedDataError from '@library-management/common/error/server/MalformedDataError'

const optionDefinitions: commandLineArgs.OptionDefinition[] = [
  { name: 'host', alias: 'h', type: String, defaultValue: 'localhost' },
  { name: 'port', alias: 'p', type: Number, defaultValue: 3000 }
]
const options = commandLineArgs(optionDefinitions)
const HOSTNAME: string = options['host']
const DEV_PORT: number = options['port']

///// App setup /////

const app = express()
app.use(cookieParser())
app.use(express.json())
routeMain(app)

app.use((err: any, req: any, res: any, next: any) => {
  if(err.type == 'entity.parse.failed') {
    res.status(400)
    show_error(res, new MalformedDataError())
    return
  }
  res.status(500)
  show_error(res, new UnknownError(), globalConfig.isDebug() ? err : null)
})

app.use((req, res) => {
  res.status(404)
  show_error(res, new ActionNotFoundError())
})

///// Other setup jobs /////

globalConfig.init()
globalConfig.dryRun()

await dbManager.initAsync()

if(globalConfig.allowPasswordReset()) {
  if(globalConfig.passwordResetLetterInConsole()) {
    if(globalConfig.isDebug()) {
      console.warn('WARNING: PASSWORD_RESET_LETTER_IN_CONSOLE is enabled. Instead of being sent by email, password reset letters will now be printed in console. This is generally unsafe and should only be used when debugging.')
    } else {
      throw new Error('Enabling PASSWORD_RESET_LETTER_IN_CONSOLE in production is not allowed.')
    }
  } else {
    throw new Error('Sending password reset letters by email is not implemented yet. Please turn off ALLOW_PASSWORD_RESET.')
  }
}

///// Run the app /////

if(globalConfig.isTest()) {
  console.log('Starting tests')
  Test.start()
  process.exit()
} else {
  console.log(`Listening on host "${HOSTNAME}"`)
  app.listen(DEV_PORT, HOSTNAME, () => {
    console.log(`Serving static files at http://localhost:${DEV_PORT}`)
    console.log(`Serving API at http://localhost:${DEV_PORT}/api`)
  })
}
