import express from 'express'
import commandLineArgs from 'command-line-args'

const optionDefinitions: commandLineArgs.OptionDefinition[] = [
  { name: 'host', alias: 'h', type: String, defaultValue: 'localhost' },
  { name: 'port', alias: 'p', type: Number, defaultValue: 3000 }
]
const options = commandLineArgs(optionDefinitions)
const HOSTNAME: string = options['host']
const DEV_PORT: number = options['port']

const app = express()

app.use(express.static('public/'))

app.get("/api", (req, res) => {
  res.contentType('application/json')
  res.json({
    success: true,
    msg: "Hello"
  })
})

console.log(`Listening on host ${HOSTNAME}`)
app.listen(DEV_PORT, HOSTNAME, () => {
  console.log(`Serving API at http://localhost:${DEV_PORT}`)
})
