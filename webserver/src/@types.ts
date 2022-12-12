export type Log = {
  address: string,
  blockHash: string,
  blockNumber: number,
  data: string,
  logIndex: number,
  topics: string[],
  transactionHash: string,
  transactionIndex: number,
  removed: boolean,
}

export type FilterResult = {
  jsonrpc: string;
  method: string;
  params: {
    subscription: string;
    result: Log
  }
}

export type GetLogsResult = {
  jsonrpc: string;
  method: string;
  result: Log[]
}

export type Filters = {
  address?: string,
  topics?: string[]
}

export type SupportedProviders = 'infura'

export type SubscriptionRes = {
  jsonrpc: string;
  id: number;
  result: string;
}

export type UnsubscriptionRes = {
  jsonrpc: string;
  id: number;
  result: boolean;
}

