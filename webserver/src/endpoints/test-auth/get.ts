import { Express, Request } from 'express'
import { ethers } from 'ethers'
import R from 'ramda'
import z from 'zod'
require('dotenv').config()

import responser from 'src/middlewares/responser'
import { CustomErrors } from 'src/errors'

const reqSchema = z.object({
  rpcProvider: z.literal('infura'),
  providerKey: z.string(),
})

type ValidatedReqType = z.infer<typeof reqSchema>

const validate = (req: Request) => {
  return reqSchema.parse({
    rpcProvider: R.path(['query', 'rpc_provider'], req),
    providerKey: R.path(['query', 'provider_key'], req),
  })
}

const handler = async (req: ValidatedReqType) => {
  const providerBuilderDict = {
    infura: ethers.providers.InfuraProvider
  }
  const prov = new providerBuilderDict[req.rpcProvider]('homestead', req.providerKey)
  try {
    const ans = await prov.getBlockNumber()
    return { currentBlock: ans }
  }
  catch {
    throw new CustomErrors(403, `Error with ${req.rpcProvider}:${req.providerKey}`)
  }
}

const routes = (app: Express) => {
  app.get('/test-auth', responser(validate, handler))
}

export default routes
