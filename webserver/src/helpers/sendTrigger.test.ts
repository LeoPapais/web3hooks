import test from 'tape'
import sinon from 'sinon'

import { spec } from './sendTrigger'
import { Subscription } from 'src/models/subscription'

test("HELPERS sendTriggers: test1 happy case", async (t) => {
  const mockDeps = {
    axios: {
      post: sinon.fake() as any
    } as any,
    SubscriptionModel: {
      updateOne: sinon.fake() as any
    } as any,
  }
  
  const sendTrigger = spec(mockDeps)

  const log1 = {
    address: 'string1',
    blockHash: 'string2',
    blockNumber: 1,
    data: 'string3',
    logIndex: 0,
    topics: ['a'],
    transactionHash: 'string4',
    transactionIndex: 2,
    removed: false,
  }

  const sub1 = {
    hookUrl: 'string5',
    _id: 'string6'
  } as Subscription

  await sendTrigger(log1, sub1)

  t.equal(mockDeps.axios.post.callCount, 1, 'Expects to call only once')
  t.equal(mockDeps.axios.post.firstArg, 'string5', 'Expects post url to be hookUrl')
  t.deepEqual(mockDeps.axios.post.lastArg, log1, 'Expects post body to be log1')
  t.equal(mockDeps.SubscriptionModel.updateOne.callCount, 1, 'Expects to call only once')
  t.equal(mockDeps.SubscriptionModel.updateOne.firstArg._id, 'string6', 'Expects update filter to use _id')

  const updateBody = {
    latestUpdate: log1.blockNumber
  }
  t.deepEqual(mockDeps.SubscriptionModel.updateOne.lastArg, updateBody, 'Expects post body to have blockNumber')
  t.end()
})
