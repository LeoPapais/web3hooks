import axios from 'axios'

import { SubscriptionModel, Subscription } from '../models/subscription'
import { Log } from '../@types'

type DependenciesType = {
  axios: typeof axios,
  SubscriptionModel: typeof SubscriptionModel
}
const sendTrigger = (_: DependenciesType) => async (newLog: Log, sub: Subscription) => {
  const blockNumber = newLog.blockNumber
  await _.axios.post(sub.hookUrl, newLog)
  await _.SubscriptionModel.updateOne({ _id: sub._id }, {
    latestUpdate: blockNumber
  })
}

export default sendTrigger({ axios, SubscriptionModel })

export const spec = sendTrigger
