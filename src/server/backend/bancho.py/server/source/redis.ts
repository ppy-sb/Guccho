import { ECONNREFUSED, ENOENT } from 'node:constants'
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
    url: env.REDIS_URL.startsWith('redis') ? env.REDIS_URL : undefined,
    socket: {
      path: env.REDIS_URL.startsWith('unix') ? env.REDIS_URL : undefined,
    },
  })

  let lastErr: Error | undefined
  client.on('error', (err: Error) => {
    const _lastErr = lastErr
    lastErr = err
    if (_lastErr?.stack === err.stack) {
      return
    }
    switch (true) {
      case ((err as any)?.errno === -ECONNREFUSED):
      case ((err as any)?.errno === -ENOENT): {
        logger.error(err)
        break
      }
      default: logger.error(err)
    }
  })
  client.on('connect', () => {
    lastErr = undefined
  })
  client.connect()

  return client
})
