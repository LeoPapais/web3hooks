import { Express } from 'express'

import get from './get'

export default (app: Express) => {
  get(app)
}