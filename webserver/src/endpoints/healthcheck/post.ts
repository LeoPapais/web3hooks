import { Express } from 'express'
require('dotenv').config()

const routes = (app: Express) => {
  app.post('/black-hole', (req, res) => { //for tests only...
    console.log('black hole!!');
    console.log(req.body)
    res.send({})
  })
  app.post('/healthcheck', (req, res) => {
    console.log('healthcheck!!');
    console.log(req.body)
    res.send({})
  })
}

export default routes
