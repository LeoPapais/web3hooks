import { createServer } from 'http'
import sinon from 'sinon'
import test from "tape"
import WebSocket, { WebSocketServer } from 'ws'

import { spec } from './websockets'

test("websockets: test type guards", (t) => {
  const input1 = {
    jsonrpc: 'string',
    id: 1,
    result: 'string',
  }
  t.equal(spec.isSubRes(input1), true, 'should evaluate as SubscriptionRes')
  t.equal(spec.isUnsubRes(input1), false, 'should evaluate as !UnsubscriptionRes')

  const input2 = {
    jsonrpc: 'string',
    id: 1,
    result: true,
  }
  t.equal(spec.isSubRes(input2), false, 'should evaluate as !SubscriptionRes')
  t.equal(spec.isUnsubRes(input2), true, 'should evaluate as UnsubscriptionRes')
  t.end()
})

test("getSocket: test getSocket", async t => {
  const mockSub = {
    hookUrl: 'string5',
    _id: 'string6'
  }

  const server = createServer()

  const wss = new WebSocketServer({ server })

  const msg3 = {
    jsonrpc: 'string',
    method: 'eth_subscription',
    params: {
      subscription: 'string2',
      result: {
        address: 'string3',
        blockHash: 'string4',
        blockNumber: 0,
        data: 'string5',
        logIndex: 1,
        topics: ['string6'],
        transactionHash: 'string7',
        transactionIndex: 2,
        removed: 3,
      }
    }
  }
  const msg2 = {
    jsonrpc: 'string',
    id: 1,
    result: true,
  }
  const msg1 = {
    jsonrpc: 'string',
    id: 1,
    result: 'string',
  }
  const recoveryFake = sinon.fake() as any

  wss.on('connection', function connection(ws1) {
    ws1.send(JSON.stringify(msg1))
    ws1.send(JSON.stringify(msg2))
    ws1.send(JSON.stringify(msg3))

    ws1.on('subscribed', () => {
      t.ok('got subscribed once')
    })
    ws1.on('unsubscribed', () => {
      t.ok('got unsubscribed once')
    })
  })

  server.listen(4001)

  const mockDeps = {
    WebSocket,
    SubscriptionModel: {
      findOne: sinon.fake.returns(mockSub) as any
    } as any,
    sendTrigger: sinon.fake(() => {
      t.equal(mockDeps.sendTrigger.callCount, 1, 'should try to send trigger once')
      t.deepEqual(mockDeps.sendTrigger.firstArg, msg3.params.result, 'send trigger with msg3.params.result')
      t.deepEqual(mockDeps.sendTrigger.lastArg, mockSub, 'send trigger with mockSub')
    }) as any,
    socketsDict: { infura: {} },
    providerEndpointDict: { infura: 'ws://localhost:4001' }
  }

  const getSocket = spec.getSocket(mockDeps)
  const ws = await getSocket(
    '1', 'infura', recoveryFake
  )
  ws.close()
  server.close()
})

test("getSocket: getSocket - test subscription", async t => {
  const server = createServer()

  const wss = new WebSocketServer({ server })

  const msg1 = {
    jsonrpc: 'string',
    id: 1,
    result: 'string',
  }

  const mockDeps = {
    WebSocket,
    SubscriptionModel: {
      findOne: sinon.fake() as any
    } as any,
    sendTrigger: sinon.fake() as any,
    socketsDict: { infura: {} } as any,
    providerEndpointDict: { infura: 'ws://localhost:4001' }
  }

  wss.on('connection', function connection(ws1) {
    ws1.send(JSON.stringify(msg1))
    mockDeps.socketsDict.infura['1'].on('subscribed', () => {
      t.ok(1, 'got subscribed once')
    })
  })

  server.listen(4001)


  const recoveryFake = sinon.fake() as any
  const getSocket = spec.getSocket(mockDeps)
  const ws = await getSocket(
    '1', 'infura', recoveryFake
  )
  server.close()
  ws.close()
})

test("getSocket: getSocket - test unsubscription", async t => {
  const server = createServer()

  const wss = new WebSocketServer({ server })

  const msg1 = {
    jsonrpc: 'string',
    id: 1,
    result: true,
  }

  const mockDeps = {
    WebSocket,
    SubscriptionModel: {
      findOne: sinon.fake() as any
    } as any,
    sendTrigger: sinon.fake() as any,
    socketsDict: { infura: {} } as any,
    providerEndpointDict: { infura: 'ws://localhost:4001' }
  }

  wss.on('connection', function connection(ws1) {
    ws1.send(JSON.stringify(msg1))
    mockDeps.socketsDict.infura['1'].on('unsubscribed', () => {
      t.ok(1, 'got unsubscribed once')
    })
  })

  server.listen(4001)

  const recoveryFake = sinon.fake() as any
  const getSocket = spec.getSocket(mockDeps)
  const ws = await getSocket(
    '1', 'infura', recoveryFake
  )
  server.close()
  ws.close()
})

test("getSocket: test new log", async t => {
  const mockSub = {
    hookUrl: 'string5',
    _id: 'string6'
  }

  const server = createServer()

  const wss = new WebSocketServer({ server })

  const msg3 = {
    jsonrpc: 'string',
    method: 'eth_subscription',
    params: {
      subscription: 'string2',
      result: {
        address: 'string3',
        blockHash: 'string4',
        blockNumber: 0,
        data: 'string5',
        logIndex: 1,
        topics: ['string6'],
        transactionHash: 'string7',
        transactionIndex: 2,
        removed: 3,
      }
    }
  }
  const recoveryFake = sinon.fake() as any

  wss.on('connection', function connection(ws1) {
    ws1.send(JSON.stringify(msg3))
  })

  server.listen(4001)

  const mockDeps = {
    WebSocket,
    SubscriptionModel: {
      findOne: sinon.fake.returns(mockSub) as any
    } as any,
    sendTrigger: sinon.fake(() => {
      t.equal(mockDeps.sendTrigger.callCount, 1, 'should try to send trigger once')
      t.deepEqual(mockDeps.sendTrigger.firstArg, msg3.params.result, 'send trigger with msg3.params.result')
      t.deepEqual(mockDeps.sendTrigger.lastArg, mockSub, 'send trigger with mockSub')
    }) as any,
    socketsDict: { infura: {} },
    providerEndpointDict: { infura: 'ws://localhost:4001' }
  }

  const getSocket = spec.getSocket(mockDeps)
  const ws = await getSocket(
    '1', 'infura', recoveryFake
  )
  ws.close()
  server.close()
})

test("getSocket: test failure to find subscription", async t => {
  const mockSub = {
    hookUrl: 'string5',
    _id: 'string6'
  }

  const server = createServer()

  const wss = new WebSocketServer({ server })

  const msg3 = {
    jsonrpc: 'string',
    method: 'eth_subscription',
    params: {
      subscription: 'string2',
      result: {
        address: 'string3',
        blockHash: 'string4',
        blockNumber: 0,
        data: 'string5',
        logIndex: 1,
        topics: ['string6'],
        transactionHash: 'string7',
        transactionIndex: 2,
        removed: 3,
      }
    }
  }
  const recoveryFake = sinon.fake() as any

  wss.on('connection', function connection(ws1) {
    ws1.send(JSON.stringify(msg3))
  })

  server.listen(4001)

  const mockDeps = {
    WebSocket,
    SubscriptionModel: {
      findOne: sinon.fake.returns(null) as any
    } as any,
    sendTrigger: sinon.fake(() => {
      t.equal(mockDeps.sendTrigger.callCount, 1, 'should try to send trigger once')
      t.deepEqual(mockDeps.sendTrigger.firstArg, msg3.params.result, 'send trigger with msg3.params.result')
      t.deepEqual(mockDeps.sendTrigger.lastArg, mockSub, 'send trigger with mockSub')
    }) as any,
    socketsDict: { infura: {} },
    providerEndpointDict: { infura: 'ws://localhost:4001' }
  }

  const getSocket = spec.getSocket(mockDeps)

  const ws = await getSocket(
    '1', 'infura', recoveryFake
  )
  await new Promise((resolve) => {
    process.on('uncaughtException', function(err){
      resolve()
    })
  })
  t.ok(1, 'should throw for missing sub')
  ws.close()
  server.close()
})

test('subscribe: success', async t => {
  const mockDeps = {
    getSocket: sinon.fake.returns({
      once: sinon.fake((eventName, cb) => {
        t.equal(eventName, 'subscribed', 'should emit subscribed')
        cb(JSON.stringify({ result: '1' }))
      }),
      send: sinon.fake(strSub => {
        const subs = JSON.parse(strSub)
        const expectedSubs = {
          "jsonrpc":"2.0", 
          "id": 1, 
          "method": "eth_subscribe", 
          "params": [
            "logs", 
            {
              "address": "1",
              "topics": ["2"]
            }
          ]
        }
        t.deepEqual(subs, expectedSubs, 'should use filters')
      })
    }) as any
  }
  const subscribe = spec.subscribe(mockDeps)
  await subscribe('3', 'infura', { address: '1', topics: ['2'] }, () => Promise.resolve())
})

test('subscribe: failure', async t => {
  const mockDeps = {
    getSocket: sinon.fake.returns({
      once: sinon.fake(async (eventName, cb) => {
        t.equal(eventName, 'subscribed', 'should emit subscribed')
        await Promise.resolve()
        cb(JSON.stringify({ result: '1' }).slice(0,3))
      }),
      send: sinon.fake()
    }) as any
  }
  const subscribe = spec.subscribe(mockDeps)
  try {
    await subscribe('3', 'infura', { address: '1', topics: ['2'] }, () => Promise.resolve())
    t.fail('should never reach this line')
  }
  catch(e) { 
    t.ok(e, 'should throw error')
  }
})

test('unsubscribe: success', async t => {
  const mockDeps = {
    socketsDict: {
      infura: {
        '1': {
          once: sinon.fake((eventName, cb) => {
            t.equal(eventName, 'unsubscribed', 'should emit unsubscribed')
            cb(JSON.stringify({ result: true }))
          }),
          send: sinon.fake(strSub => {
            const subs = JSON.parse(strSub)
            const expectedSubs = {
              "jsonrpc":"2.0", 
              "id": 1, 
              "method": "eth_unsubscribe", 
              "params": ["2"]
            }
            t.deepEqual(subs, expectedSubs, 'should use filters')
          })
        } as any
      }
    },
  }
  const unsubscribe = spec.unsubscribe(mockDeps)
  await unsubscribe('1', 'infura', '2')
})

test('unsubscribe: failure', async t => {
  const mockDeps = {
    socketsDict: {
      infura: {
        '1': {
          once: sinon.fake((eventName, cb) => {
            t.equal(eventName, 'unsubscribed', 'should emit unsubscribed')
            cb(JSON.stringify({ result: false }))
          }),
          send: sinon.fake(strSub => {
            const subs = JSON.parse(strSub)
            const expectedSubs = {
              "jsonrpc":"2.0", 
              "id": 1, 
              "method": "eth_unsubscribe", 
              "params": ["2"]
            }
            t.deepEqual(subs, expectedSubs, 'should use filters')
          })
        } as any
      }
    },
  }
  const unsubscribe = spec.unsubscribe(mockDeps)
  try {
    await unsubscribe('1', 'infura', '2')
    t.fail('should never reach here. Should throw instead.')
  }
  catch (e) {
    t.ok(e, 'should throw')
  }
})

// test if getSocket returns the same ws on a second call with the same params.
// test behaviour when error before opening socket
// test behaviour when error after opening socket
