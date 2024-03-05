import type { Buffer } from 'node:buffer'
import type { Document } from 'bson'
import * as BSON from 'bson'
import { commandOptions, type createClient } from 'redis'
import { match } from 'switch-pattern'
import { client as getRedis } from '../source/redis'
import { SessionStore, sessionConfig } from '$base/server/session/session-store'
import type { Session, SessionIdType } from '$base/server/session'
import { Monitored } from '$base/server/@extends'

type KeyOf<T extends Session> = SessionIdType<T> & { __brand: 'key' }
export class RedisSessionStore<TDoc extends Document & Session<any>> extends SessionStore<TDoc> implements SessionStore<TDoc> {
  get [Monitored.status](): Monitored[typeof Monitored.status] {
    return this.#redis?.isReady ? [Monitored.Status.Up] : [Monitored.Status.Down, 'failed to connect to session server']
  }

  static REDIS_SESSION_PREFIX = 'session:guccho:'
  #redis: ReturnType<typeof createClient>

  #askForBuffer = commandOptions({ returnBuffers: true })

  constructor() {
    super()
    this.#redis = getRedis()
  }

  #parseSession<TDoc>(_session: Buffer): TDoc | undefined {
    const session = BSON.deserialize(_session)
    return session as TDoc
  }

  #key(key: SessionIdType<TDoc>): KeyOf<TDoc> {
    return (RedisSessionStore.REDIS_SESSION_PREFIX + key) as KeyOf<TDoc>
  }

  #removePrefix(key: KeyOf<TDoc>): SessionIdType<TDoc> {
    return key.slice(RedisSessionStore.REDIS_SESSION_PREFIX.length)
  }

  async #get(key: KeyOf<TDoc>): Promise<TDoc | undefined> {
    const result = await this.#redis.get(this.#askForBuffer, key)
    if (!result) {
      return
    }
    return this.#parseSession<TDoc>(result) as TDoc
  }

  async get(key: SessionIdType<TDoc>): Promise<TDoc | undefined> {
    return this.#get(this.#key(key))
  }

  async #set(key: KeyOf<TDoc>, value: TDoc) {
    const stream = BSON.serialize(value, { ignoreUndefined: true })

    await this.#redis.set(key, stream as Buffer, { EX: sessionConfig.expire / 1000 })
    return key
  }

  async set(key: SessionIdType<TDoc>, value: TDoc): Promise<SessionIdType<TDoc>> {
    return this.#removePrefix(await this.#set(this.#key(key), value))
  }

  async #destroy(key: SessionIdType<TDoc>): Promise<boolean> {
    return !!this.#redis.del(key)
  }

  async destroy(key: SessionIdType<TDoc>): Promise<boolean> {
    return this.#destroy(this.#key(key))
  }

  async forEach(cb: (val: TDoc, key: SessionIdType<TDoc>) => any): Promise<void> {
    let cursor = 0
    do {
      const result = await this.#redis.scan(cursor, { MATCH: this.#key('*' as unknown as KeyOf<SessionIdType<TDoc>>) })
      cursor = result.cursor

      for (const key of result.keys) {
        const session = await this.#get(key as KeyOf<TDoc>)
        if (!session) {
          await this.#destroy(key as KeyOf<TDoc>)
          return
        }
        await cb(session, this.#removePrefix(key as KeyOf<TDoc>))
      }
    } while (cursor)
  }

  async findAll(query: any): Promise<Record<SessionIdType<TDoc>, TDoc>> {
    const returnValue = {} as Record<SessionIdType<TDoc>, TDoc>

    await this.forEach((val, key) => {
      if (match(val).deepSome(query)) {
        returnValue[key] = val
      }
    })

    return returnValue
  }
}
