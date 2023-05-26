import { createClient } from 'redis'
import { Logger } from '../../log'
import { env } from './env'

const logger = Logger.child({ label: 'redis' })

export function client() {
  if (!('REDIS_URL' in env)) {
    throw new Error('required redis client without set env')
  }
  const client = createClient({
    url: env.REDIS_URL,
  })
  client.on('error', err => logger.error('Redis Client', err))
  client.connect()

  return client
}
