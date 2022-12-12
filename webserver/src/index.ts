import BPromise from "bluebird"
require('dotenv').config()

global.Promise = <any>BPromise

import { connect } from 'src/models/mongo'
import recover from 'src/helpers/recover'
import openServer from 'src/server'

connect()
  .then(openServer)
  .then(recover)