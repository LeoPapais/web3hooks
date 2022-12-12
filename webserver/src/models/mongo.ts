import mongoose from 'mongoose'

let backoffPower = 0
let backoffTime = 1000
const maxBackoffPower = 5

export async function connect (): Promise<void> {
  console.info('Connecting...')

  try {
    await mongoose.connect(process.env.MONGO_DB_URI || '')
    console.info('Database', 'Connection Successful')
  }
  catch (err) {
    console.error('Database', 'Connection Failed')
    console.error(err)
    await Promise.delay(backoffTime * (2 ** backoffPower))
    if (backoffPower < maxBackoffPower) backoffPower++
    await connect()
  }
}

export async function shutdown(): Promise<void> {
  await mongoose.disconnect()
  console.info('Database', 'Connection Closed')
}
