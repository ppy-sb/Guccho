import { createClient } from 'redis'
import { Logger } from '../../log'
import { env } from '~/server/env'

const logger = Logger.child({ label: 'redis' })

export const client = lazySingleton(() => {
  if (!('REDIS_URL' in env)) {
    const err = new Error('required redis client without set env "REDIS_URL"')
    logger.error(err)
    throw err
  }

  const client = createClient({
    url: env.REDIS_URL,
  })
  client.on('error', err => logger.error('Redis Client', err))
  client.connect()

  return client
})
