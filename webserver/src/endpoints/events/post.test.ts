import test from "tape"
import { Request } from 'express'

import { spec } from './post'

const { validate, handler } = spec

test("POST /events: test1 happy case validate", (t) => {
  const input1 = {
    query: {
      rpc_provider: 'infura',
      provider_key: '1234',
    },
    body: {
      address: '0x911',
      topics: ['0x190'],
      hookUrl: 'http://localhost:3001'
    }
  }
  const expected1 = {
    rpcProvider: 'infura',
    providerKey: '1234',
    address: '0x911',
    topics: ['0x190'],
    hookUrl: 'http://localhost:3001',
  }
  const output1 = validate(input1 as any as Request)
  t.deepEqual(expected1, output1, 'Expects output to be fully formatted.')
  t.end()
})

test("POST /events: test2 happy case validate", (t) => {
  const input1 = {
    query: {
      rpc_provider: 'infura',
      provider_key: '1234',
    },
    body: {
      address: '0x911',
      hookUrl: 'http://localhost:3001'
    }
  }
  const expected1 = {
    rpcProvider: 'infura',
    providerKey: '1234',
    address: '0x911',
    hookUrl: 'http://localhost:3001',
    topics: undefined
  }
  const output1 = validate(input1 as any as Request)
  t.deepEqual(expected1, output1, 'Expects output to be fully formatted.')
  t.end()
})

test("POST /events: test3 validate - missing rpc_provider", (t) => {
  t.throws(() => { 
    try {
      validate({
        query: {
          provider_key: '1234',
        },
        body: {
          address: '0x911',
          hookUrl: 'http://localhost:3001'
        }
      } as any as Request)
    }
    catch (e) {
      throw new Error('Validation Error')
    }
  }, new RegExp('Validation Error'), 'Should throw for missing rpc')
  t.throws(() => { 
    try {
      validate({
        query: {
          rpc_provider: 'infura',
        },
        body: {
          address: '0x911',
          hookUrl: 'http://localhost:3001'
        }
      } as any as Request)
    }
    catch (e) {
      throw new Error('Validation Error')
    }
  }, new RegExp('Validation Error'), 'Should throw for missing key')
  t.throws(() => { 
    try {
      validate({
        query: {
          rpc_provider: 'infura',
          provider_key: '1234',
        },
        body: {
          hookUrl: 'http://localhost:3001'
        }
      } as any as Request)
    }
    catch (e) {
      throw new Error('Validation Error')
    }
  }, new RegExp('Validation Error'), 'Should throw for missing address')
  t.throws(() => { 
    try {
      validate({
        query: {
          rpc_provider: 'infura',
          provider_key: '1234',
        },
        body: {
          address: '0x911',
        }
      } as any as Request)
    }
    catch (e) {
      throw new Error('Validation Error')
    }
  }, new RegExp('Validation Error'), 'Should throw for missing hookUrl')
  t.end()
})
