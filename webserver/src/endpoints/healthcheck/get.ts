import { Express } from 'express'
require('dotenv').config()

const routes = (app: Express) => {
  app.get('/healthcheck', (req, res) => {
    console.log('healthcheck!!');
    console.log(req.body)
    res.send({})
  })
}

export default routes
