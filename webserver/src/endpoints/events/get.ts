import { Express, Request } from 'express'
import { ethers } from 'ethers'
import R from 'ramda'
import z from 'zod'
require('dotenv').config()

import settings from 'src/settings'
import responser from 'src/middlewares/responser'
import { CustomErrors } from 'src/errors'
import { Log } from 'src/@types'

const reqSchema = z.object({
  rpcProvider: z.literal('infura'),
  providerKey: z.string(),
  address: z.string(),
  topics: z.array(z.string()).optional(),
})

type ValidatedReqType = z.infer<typeof reqSchema>

const arrayfyPath = (path: string[], obj: unknown) => {
  const elem = R.pathOr(path, [], obj)
  return typeof elem == typeof [] ? elem : [elem]
}

const validate = (req: Request): ValidatedReqType => {
  return reqSchema.parse({
    rpcProvider: R.path(['query', 'rpc_provider'], req),
    providerKey: R.path(['query', 'provider_key'], req),
    address: R.path(['query', 'address'], req),
    topics: arrayfyPath(['query', 'topics'], req)
  })
}

const handler = async (req: ValidatedReqType): Promise<Log[]> => {
  const providerBuilderDict = {
    infura: ethers.providers.InfuraProvider
  }
  const prov = new providerBuilderDict[req.rpcProvider]('homestead', req.providerKey)
  try {
    const ans = await prov.getLogs({
      address: req.address,
      topics: req.topics,
      fromBlock: '0xf61fc6',
      toBlock: '0xf61fc7',
    })

    return ans.slice(0, 5)
  }
  catch (e) {
    throw new CustomErrors(403, `Error with ${req.rpcProvider}:${req.providerKey}`)
  }
}

const routes = (app: Express) => {
  app.get(settings.server.routes.events, responser(validate, handler))
}

export default routes
