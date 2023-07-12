import { Buffer } from 'node:buffer'
import type { Document } from 'bson'
import { commandOptions } from 'redis'
import type { createClient } from 'redis'
import * as BSON from 'bson'
import { match } from 'switch-pattern'
import { client as getRedis } from '../source/redis'
import type { Session } from '$base/server/session'
import { HouseKeeperSession } from '$base/server/session/session-store'

const REDIS_SESSION_PREFIX = 'session.guccho'
export class RedisSessionStore<TDoc extends Document & Session<any>> extends HouseKeeperSession<string, TDoc> implements HouseKeeperSession<string, TDoc> {
  #r: ReturnType<typeof createClient>

  #askForBuffer = commandOptions({ returnBuffers: true })

  constructor() {
    super()
    this.#r = getRedis()
  }

  #parseSession<TDoc>(_session: Buffer): TDoc | undefined {
    const session = BSON.deserialize(_session)
    return session as TDoc
  }

  async get(key: string): Promise<TDoc | undefined> {
    const result = await this.#r.hGet(this.#askForBuffer, REDIS_SESSION_PREFIX, key)
    if (!result) {
      return
    }
    return this.#parseSession<TDoc>(result) as TDoc
  }

  async set(key: string, value: TDoc): Promise<string> {
    const stream = BSON.serialize(value)
    await this.#r.hSet(REDIS_SESSION_PREFIX, key, Buffer.from(stream.buffer))
    return key
  }

  async destroy(key: string): Promise<boolean> {
    return !!this.#r.hDel(REDIS_SESSION_PREFIX, key)
  }

  async forEach(cb: (val: TDoc, key: string) => any): Promise<void> {
    const results = await this.#r.hGetAll(this.#askForBuffer, REDIS_SESSION_PREFIX)

    for (const sessionId in results) {
      const session = this.#parseSession<TDoc>(results[sessionId])
      if (!session) {
        await this.destroy(sessionId as string)
        return
      }
      cb(session, sessionId as string)
    }
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
