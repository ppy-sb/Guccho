import { createClient } from 'redis'

export function client() {
  const client
    = process.env.BANCHO_PY_REDIS_URI
      ? createClient({
        url: process.env.BANCHO_PY_REDIS_URI,
      })
      : undefined
  if (client) {
    client.on('error', err => console.error('Redis Client', err))
    client.connect()
  }
  return client
}
