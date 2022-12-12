import axios from 'axios'
import R from 'ramda'

import { Subscription, SubscriptionModel } from 'src/models/subscription'
import sendTrigger from 'src/helpers/sendTrigger'
import { subscribe } from 'src/stateful/websockets'
import type { GetLogsResult, SupportedProviders } from '../@types'

const providerEndpointDict: Record<SupportedProviders, string> = {
  infura: 'https://mainnet.infura.io/v3/'
}

const recoverSubscription = async (sub: Subscription) => {
  if (!sub.latestUpdate) return
  const url = providerEndpointDict[sub.rpcProvider]
  const fromBlock = '0x' + (parseInt(sub.latestUpdate, 16) + 1).toString(16)
  const param = R.reject(R.isNil, {
    address: sub.address,
    topics: sub.topics?.length ? sub.topics : null,
    fromBlock,
  })
  try {
    const { data } = await axios.post<GetLogsResult>(url + sub.providerKey, {
      jsonrpc: '2.0',
      method: 'eth_getLogs',
      id: 1,
      params: [param]
    })

    const { subscriptionId } = await subscribe(sub.providerKey, sub.rpcProvider, {
      address: sub.address,
      topics: sub.topics
    }, fullRecovery)

    await SubscriptionModel.updateOne({ _id: sub._id }, {
      subscriptionId
    })

    await Promise.map(
      data.result, 
      log => sendTrigger(log, sub),
      { concurrency: 10 }
    )
  }
  catch (e) {
    console.error(e)
    throw e
  }
}

export const partialRecovery = async (rpcProvider: 'infura', providerKey: string): Promise<void> => {
  const subs = await SubscriptionModel.find({
    rpcProvider,
    providerKey,
  })
  await Promise.mapSeries(subs, recoverSubscription)
}

const fullRecovery = async () => {
  const subs = await SubscriptionModel.find({})
  await Promise.mapSeries(subs, recoverSubscription)
}

export default fullRecovery