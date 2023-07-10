import type { RedisClientType } from 'redis'
import { createClient } from 'redis'
import { Logger } from '../../log'
import { env } from '~/server/env'

const logger = Logger.child({ label: 'redis' })

let _client: RedisClientType | undefined
export function client() {
  if (!('REDIS_URL' in env)) {
    throw new Error('required redis client without set env')
  }
  if (_client) {
    return _client
  }

  _client = createClient({
    url: env.REDIS_URL,
  })
  _client.on('error', err => logger.error('Redis Client', err))
  _client.connect()

  return _client
}
