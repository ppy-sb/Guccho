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

  const lastErr = new Map<string, { err: Error; lastReportedAt: number; count: number; debounce: number; adaptiveRatio: number }>()
  client.on('error', (err: Error) => {
    const same = lastErr.get(err.stack || err.message)
    if (same) {
      if (same.err.stack === err?.stack) {
        const now = Date.now()

        const gap = now - same.lastReportedAt

        if (gap <= same.debounce) {
          same.count++
          same.err = err
        }

        if ((same.count > 2) && (gap >= same.debounce * same.adaptiveRatio ** 2)) {
          same.debounce = same.debounce / same.adaptiveRatio
        }

        if (gap > same.debounce) {
          if (same.count > 1) {
            logger.error({ ...same.err, message: `(${same.count}x) ${same.err.message}` })
            same.debounce *= same.adaptiveRatio
          }
          else {
            logger.error(err)
          }

          same.count = 0
          same.err = err
          same.lastReportedAt = now
        }
      }
    }
    else {
      logger.error(err)
      lastErr.set(err.stack || err.message, { err, lastReportedAt: Date.now(), debounce: 1000, count: 0, adaptiveRatio: 1.3 })
    }
  })

  client.connect()

  return client
})
