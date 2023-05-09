import { createClient } from 'redis'

import { env } from './env'

export function client() {
  if (!('REDIS_URL' in env)) {
    throw new Error('required redis client without set env')
  }
  const client = createClient({
    url: env.REDIS_URL,
  })
  client.on('error', err => console.error('Redis Client', err))
  client.connect()

  return client
}
