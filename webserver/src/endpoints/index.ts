import { Express } from 'express'

import events from './events'
import testAuth from './test-auth'
import healthcheck from './healthcheck'

export default (app: Express) => {
  events(app)
  testAuth(app)
  healthcheck(app)
}