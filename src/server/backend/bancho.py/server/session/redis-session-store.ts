import { Buffer } from 'node:buffer'
import type { Document } from 'bson'
import { commandOptions } from 'redis'
import type { createClient } from 'redis'
import * as BSON from 'bson'
import { match } from 'switch-pattern'
import { client as getRedis } from '../source/redis'
import type { Session } from '$base/server/session'
import { SessionStore, sessionConfig } from '$base/server/session/session-store'
import { Monitored } from '$base/server/@extends'

type Key = string & { __brand: 'key' }
export class RedisSessionStore<TDoc extends Document & Session<any>> extends SessionStore<string, TDoc> implements SessionStore<string, TDoc> {
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

  #key(key: string): Key {
    return (RedisSessionStore.REDIS_SESSION_PREFIX + key) as Key
  }

  #removePrefix(key: Key): string {
    return key.slice(RedisSessionStore.REDIS_SESSION_PREFIX.length)
  }

  async #get(key: Key): Promise<TDoc | undefined> {
    const result = await this.#redis.get(this.#askForBuffer, key)
    if (!result) {
      return
    }
    return this.#parseSession<TDoc>(result) as TDoc
  }

  async get(key: string): Promise<TDoc | undefined> {
    return this.#get(this.#key(key))
  }

  async #set(key: Key, value: TDoc) {
    const stream = BSON.serialize(value)
    await this.#redis.set(key, Buffer.from(stream.buffer), { EX: sessionConfig.expire / 1000 })
    return key
  }

  async set(key: string, value: TDoc): Promise<string> {
    return this.#removePrefix(await this.#set(this.#key(key), value))
  }

  async #destroy(key: string): Promise<boolean> {
    return !!this.#redis.del(key)
  }

  async destroy(key: string): Promise<boolean> {
    return this.#destroy(this.#key(key))
  }

  async forEach(cb: (val: TDoc, key: string) => any): Promise<void> {
    let cursor = 0
    do {
      const result = await this.#redis.scan(cursor, { MATCH: this.#key('*') })
      cursor = result.cursor

      for (const key of result.keys) {
        const session = await this.#get(key as Key)
        if (!session) {
          await this.#destroy(key as Key)
          return
        }
        await cb(session, this.#removePrefix(key as Key))
      }
    } while (cursor)
  }

  async findAll(query: any): Promise<Record<string, TDoc>> {
    const returnValue = {} as Record<string, TDoc>

    await this.forEach((val, key) => {
      if (match(val).deepSome(query)) {
        returnValue[key] = val
      }
    })

    return returnValue
  }
}
