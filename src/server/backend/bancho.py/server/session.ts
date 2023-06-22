import { Buffer } from 'node:buffer'
import type { Document } from 'bson'
import * as BSON from 'bson'
import { commandOptions } from 'redis'
import { Logger } from '../log'
import { client as getRedis } from './source/redis'
import { env } from '~/server/env'
import type { Session, SessionStore } from '$base/server/session'
import { SessionProvider as Base } from '$base/server/session'

const logger = Logger.child({ label: 'session' })

const REDIS_SESSION_PREFIX = 'session.guccho'

const _logger = logger.child({ store: 'redis' })
function parseSession<TSession>(_session: Buffer): TSession | undefined {
  const session = BSON.deserialize(_session)
  if (!('lastActivity' in session)) {
    _logger.error({ message: 'found invalid session', session })
    return
  }
  if (!(session.lastActivity instanceof Date)) {
    _logger.error({ message: 'found invalid session lastActivity', session })
    return
  }
  return session as TSession
}

function createStore<TSessionKey extends string, TSession extends Session & Document>() {
  const r = getRedis()
  if (!r) {
    throw new Error('redis session store requires redis connection')
  }
  const askForBuffer = commandOptions({ returnBuffers: true })
  return {
    async get(key: TSessionKey) {
      const result = await r.hGet(askForBuffer, REDIS_SESSION_PREFIX, key)
      if (!result) {
        return
      }
      return BSON.deserialize(result) as TSession
    },
    async set(key: TSessionKey, value: TSession) {
      const stream = BSON.serialize(value)
      await r.hSet(REDIS_SESSION_PREFIX, key, Buffer.from(stream.buffer))
      return key
    },
    async destroy(key: TSessionKey) {
      return !!r.hDel(REDIS_SESSION_PREFIX, key)
    },

    async forEach(cb: (val: TSession, key: TSessionKey) => any) {
      const results = await r.hGetAll(askForBuffer, REDIS_SESSION_PREFIX)

      for (const sessionId in results) {
        const session = parseSession<TSession>(results[sessionId])
        if (!session) {
          this.destroy(sessionId as TSessionKey)
          return
        }
        cb(session, sessionId as TSessionKey)
      }
    },
  } as SessionStore<TSessionKey, TSession>
}

export class SessionProvider extends Base<string, Session> {
  prepareStore() {
    return env?.SESSION_STORE ? createStore() : super.prepareStore()
  }
}
