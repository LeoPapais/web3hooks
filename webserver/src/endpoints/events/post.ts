import { Express, Request } from 'express'
import { ethers } from 'ethers'
import R from 'ramda'
import z from 'zod'
require('dotenv').config()

import { SubscriptionModel } from 'src/models/subscription'
import { subscribe } from 'src/stateful/websockets'
import { partialRecovery } from 'src/helpers/recover'
import settings from 'src/settings'
import responser from 'src/middlewares/responser'

const reqSchema = z.object({
  rpcProvider: z.literal('infura'),
  providerKey: z.string(),
  hookUrl: z.string(),
  address: z.string(),
  topics: z.array(z.string()).optional(),
})

type ValidatedReqType = z.infer<typeof reqSchema>

const validate = (req: Request): ValidatedReqType => {
  return reqSchema.parse({
    rpcProvider: R.path(['query', 'rpc_provider'], req),
    providerKey: R.path(['query', 'provider_key'], req),
    address: R.path(['body', 'address'], req),
    topics: R.path(['body', 'topics'], req),
    hookUrl: R.path(['body', 'hookUrl'], req)
  })
}

const handler = async (req: ValidatedReqType): Promise<{ zapId: string }> => {
  const newFilter = R.pick(['address', 'topics'], req)
  const { subscriptionId } = await subscribe(req.providerKey, req.rpcProvider, newFilter, partialRecovery) // todo: fix this fullrecovery dep
  
  const prov = new ethers.providers.InfuraProvider('homestead', req.providerKey)

  const blockNumber = await prov.getBlockNumber()

  const sub = await SubscriptionModel.create({
    hookUrl: req.hookUrl,
    subscriptionId: subscriptionId,
    rpcProvider: req.rpcProvider,
    providerKey: req.providerKey,
    latestUpdate: '0x' + blockNumber.toString(16),
    ...newFilter
  })

  return { zapId: sub._id }
}

export default (app: Express) => {
  app.post(
    settings.server.routes.events, 
    responser<ValidatedReqType, Promise<{ zapId: string }>>(validate, handler)
  )
}

export const spec = {
  validate,
  handler
}