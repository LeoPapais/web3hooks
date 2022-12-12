import { Express } from 'express'

import post from './post'
import get from './get'
import del from './delete'

export default (app: Express) => {
  post(app)
  del(app)
  get(app)
}