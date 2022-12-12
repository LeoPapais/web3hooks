import express from 'express'
import bodyParser from 'body-parser'
require('dotenv').config()

import endpoints from './endpoints'
import settings from './settings'
import authentication from 'src/middlewares/authentication'


const open = () => {
  const app = express()
  app.use(bodyParser.json())
  app.use(authentication)
  endpoints(app)

  app.listen(settings.server.port, () => {
    console.log(`[server]: Server is running at http://localhost:${settings.server.port}`)
  })
}

export default open
