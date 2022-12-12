import { Express, Request } from 'express'
import { ethers } from 'ethers'
import R from 'ramda'
import z from 'zod'
require('dotenv').config()

import { unsubscribe } from 'src/stateful/websockets'
import { SubscriptionModel } from 'src/models/subscription'
import settings from 'src/settings'
import responser from 'src/middlewares/responser'
import { CustomErrors } from 'src/errors'

const reqSchema = z.object({
  rpcProvider: z.literal('infura'),
  providerKey: z.string(),
  zapId: z.string(),
})

type ValidatedReqType = z.infer<typeof reqSchema>

const validate = (req: Request) => {
  return reqSchema.parse({
    rpcProvider: R.path(['query', 'rpc_provider'], req),
    providerKey: R.path(['query', 'provider_key'], req),
    zapId: R.path(['query', 'zap_id'], req)
  })
}

const handler = async (req: ValidatedReqType) => {
  const sub = await SubscriptionModel.findById(req.zapId)
  if (!sub) throw new CustomErrors(400, 'Zap Id not found.')

  await SubscriptionModel.deleteOne({ _id: req.zapId })
  await unsubscribe(req.providerKey, req.rpcProvider, sub.subscriptionId)
  return { message: 'ok' }
}

const routes = (app: Express) => {
  app.delete(settings.server.routes.events, responser(validate, handler))
}

export default routes
