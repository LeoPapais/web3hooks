import WebSocket from 'ws'

import { SubscriptionModel } from 'src/models/subscription'
import sendTrigger from 'src/helpers/sendTrigger'
import type { 
  SupportedProviders, 
  FilterResult,
  SubscriptionRes,
  UnsubscriptionRes,
  Filters 
} from 'src/@types'

type SocketsDictType = Record<SupportedProviders, Record<string, WebSocket>>
const socketsDict: SocketsDictType = {
  infura: {}
}

type EndpointDictType = Record<SupportedProviders, string>
const providerEndpointDict: EndpointDictType = {
  infura: process.env.INFURA_MAINNET_WS || ''
}

function isSubRes(msg: MessageType): msg is SubscriptionRes {
  return typeof (msg as SubscriptionRes).result === 'string'
}
function isUnsubRes(msg: MessageType): msg is UnsubscriptionRes {
  return typeof (msg as UnsubscriptionRes).result === 'boolean'
}

type GetSocketDependenciesType = {
  WebSocket: typeof WebSocket;
  SubscriptionModel: typeof SubscriptionModel;
  sendTrigger: typeof sendTrigger;
  socketsDict: SocketsDictType;
  providerEndpointDict: EndpointDictType;
}

type GetSocketType = (_: GetSocketDependenciesType) => (
  providerKey: string, 
  rpcProvider: SupportedProviders,
  partialRecovery: (a: 'infura',  b: string) => Promise<void>,
) => Promise<WebSocket>


const _getSocket: GetSocketType = _ => async (providerKey, rpcProvider, partialRecovery) => {
  if (_.socketsDict[rpcProvider][providerKey]) return _.socketsDict[rpcProvider][providerKey]
  const ws = new _.WebSocket(`${_.providerEndpointDict[rpcProvider]}/${providerKey}`)
  _.socketsDict[rpcProvider][providerKey] = ws

  ws.on('close', async () => {
    delete socketsDict[rpcProvider][providerKey]
    await partialRecovery(rpcProvider, providerKey)
  })

  ws.on('message', async (msg: Buffer) => {
    const message: MessageType = JSON.parse(msg.toString())
    if (isSubRes(message)) {
      ws.emit('subscribed', msg)
    }
    else if (isUnsubRes(message)) {
      ws.emit('unsubscribed', msg)
    }
    else {
      const subscriptionId = message.params.subscription
      const sub = await _.SubscriptionModel.findOne({ subscriptionId })
      if (!sub) {
        throw new Error(`Sub ${subscriptionId} not found`)
      }
      await _.sendTrigger(message.params.result, sub)
    }
  })

  return new Promise((resolve, reject) => {
    let isResolved = false
    ws.on('open', () => {
      if (!isResolved) {
        isResolved = true
        resolve(ws)
      }
    })
    ws.on('error', (e: Error) => {
      if (!isResolved) {
        isResolved = true
        reject(e)
      }
    })
  })
}

type MessageType = SubscriptionRes | FilterResult | UnsubscriptionRes

const getSocket = _getSocket({ WebSocket, SubscriptionModel, sendTrigger, socketsDict, providerEndpointDict })

type SubscribeDepsType = {
  getSocket: typeof getSocket,
}

const _subscribe = (_: SubscribeDepsType) => async (providerKey:string, rpcProvider: SupportedProviders, filters: Filters, partialRecovery: (a: 'infura',  b: string) => Promise<void>): Promise<{ subscriptionId: string }> => {
  const ws = await _.getSocket(providerKey, rpcProvider, partialRecovery)
  const subscription = {
    "jsonrpc":"2.0", 
    "id": 1, 
    "method": "eth_subscribe", 
    "params": [
      "logs", 
      filters
    ]
  }
  return new Promise((resolve, reject) => {
    ws.once('subscribed', (msg: Buffer) => {
      try {
        const message: SubscriptionRes = JSON.parse(msg.toString())
        resolve({ subscriptionId: message.result })
      }
      catch (err) {
        reject(err)
      }
    })
    ws.send(JSON.stringify(subscription))
  })
}
export const subscribe = _subscribe({ getSocket })

type UnsubscriptionDepsType = {
  socketsDict: SocketsDictType
}
type UnsubscribeType = (_: UnsubscriptionDepsType) => (providerKey:string, rpcProvider: SupportedProviders, subscriptionId: string) => Promise<void>
const _unsubscribe: UnsubscribeType = _ => async (providerKey, rpcProvider, subscriptionId) => {
  const ws = _.socketsDict[rpcProvider][providerKey]
  const subscription = {
    "jsonrpc":"2.0", 
    "id": 1, 
    "method": "eth_unsubscribe", 
    "params": [subscriptionId]
  }
  return new Promise((resolve, reject) => {
    ws.once('unsubscribed', (msg: Buffer) => {
      try {
        const message: SubscriptionRes = JSON.parse(msg.toString())
        if (!message.result) reject(new Error('Failed to unsubscribe. Try again later.'))
        else resolve()
      }
      catch (err) {
        reject(err)
      }
    })
    ws.send(JSON.stringify(subscription))
  })
}

export const unsubscribe = _unsubscribe({ socketsDict })
export const spec = {
  isSubRes,
  isUnsubRes,
  getSocket: _getSocket,
  subscribe: _subscribe,
  unsubscribe: _unsubscribe,
}
