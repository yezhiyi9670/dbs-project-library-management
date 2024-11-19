import express from 'express'
import commandLineArgs from 'command-line-args'
import routeMain from './app/routes'
import globalConfig from './app/config/globalConfig'

const optionDefinitions: commandLineArgs.OptionDefinition[] = [
  { name: 'host', alias: 'h', type: String, defaultValue: 'localhost' },
  { name: 'port', alias: 'p', type: Number, defaultValue: 3000 }
]
const options = commandLineArgs(optionDefinitions)
const HOSTNAME: string = options['host']
const DEV_PORT: number = options['port']

///// App setup /////

const app = express()
routeMain(app)

///// Other setup jobs /////

globalConfig.init()
globalConfig.dryRun()

if(globalConfig.allowPasswordReset()) {
  if(globalConfig.passwordResetLetterInConsole()) {
    if(globalConfig.debug()) {
      console.warn('WARNING: PASSWORD_RESET_LETTER_IN_CONSOLE is enabled. Instead of sent by email, password reset letters will now print in console. This is generally unsafe and should only be used when debugging.')
    } else {
      throw new Error('Enabling PASSWORD_RESET_LETTER_IN_CONSOLE in production is not allowed.')
    }
  } else {
    throw new Error('Sending password reset letters by email is not implemented yet. Please turn off ALLOW_PASSWORD_RESET.')
  }
}

///// Run the app /////

console.log(`Listening on host ${HOSTNAME}`)
app.listen(DEV_PORT, HOSTNAME, () => {
  console.log(`Serving static files at http://localhost:${DEV_PORT}`)
  console.log(`Serving API at http://localhost:${DEV_PORT}/api`)
})
