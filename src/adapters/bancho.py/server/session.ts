import { Buffer } from 'node:buffer'
import type { Document } from 'bson'
import { BSON } from 'bson'
import { commandOptions } from 'redis'
import { env, client as getRedis } from './source/redis'
import type { Session, SessionStore } from '$def/server/session'
import { SessionProvider as Base } from '$def/server/session'

const r = getRedis()

const REDIS_SESSION_PREFIX = 'session.guccho'

function createStore<T extends string, K extends Session & Document>(): SessionStore<T, K> {
  if (!r) {
    throw new Error('redis session store requires redis connection')
  }
  const askForBuffer = commandOptions({ returnBuffers: true })
  return {
    async get(key: T) {
      const result = await r.hGet(askForBuffer, REDIS_SESSION_PREFIX, key)
      if (!result) {
        return
      }
      return <K>BSON.deserialize(result)
    },
    async set(key: T, value: K) {
      const stream = BSON.serialize(value)
      await r.hSet(REDIS_SESSION_PREFIX, key, Buffer.from(stream.buffer))
      return key
    },
    async destroy(key: T) {
      return !!r.hDel(REDIS_SESSION_PREFIX, key)
    },

    async forEach(cb: (_: K, __: T) => any) {
      const results = await r.hGetAll(askForBuffer, REDIS_SESSION_PREFIX)

      for (const sessionId in results) {
        cb(<K>BSON.deserialize(results[sessionId]), <T>sessionId)
      }
    },
  }
}

export class SessionProvider extends Base<string, Session> {
  prepareStore() {
    return env?.USE_REDIS_SESSION_STORE ? createStore() : super.prepareStore()
  }
}
