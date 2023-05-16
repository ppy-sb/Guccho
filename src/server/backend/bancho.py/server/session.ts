import { Buffer } from 'node:buffer'
import type { Document } from 'bson'
import { BSON } from 'bson'
import { commandOptions } from 'redis'
import { client as getRedis } from './source/redis'
import { env } from './source/env'
import type { Session, SessionStore } from '$def/server/session'
import { SessionProvider as Base } from '$def/server/session'

const REDIS_SESSION_PREFIX = 'session.guccho'

function createStore<
TSessionKey extends string,
TSession extends Session & Document,
>(): SessionStore<TSessionKey, TSession> {
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
      return <TSession>BSON.deserialize(result)
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
        cb(<TSession>BSON.deserialize(results[sessionId]), <TSessionKey>sessionId)
      }
    },
  }
}

export class SessionProvider extends Base<string, Session> {
  prepareStore() {
    return env?.SESSION_STORE ? createStore() : super.prepareStore()
  }
}
