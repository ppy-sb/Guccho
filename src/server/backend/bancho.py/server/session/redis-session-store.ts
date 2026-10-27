import { Buffer } from 'node:buffer'
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

  static readonly REDIS_SESSION_PREFIX = 'session:guccho:'

  /**
   * `session-index:guccho:<userId>` is a SET of that user's session ids.
   *
   * Without it, "all sessions of user X" is a full keyspace SCAN + GET + BSON
   * decode; anonymous sessions (created for every cookieless request) are the
   * overwhelming majority of the keyspace, so that is O(millions) per call.
   * Kept under its own prefix so `session:guccho:*` scans stay session-only.
   */
  static readonly REDIS_SESSION_INDEX_PREFIX = 'session-index:guccho:'

  #redis: ReturnType<typeof createClient>

  #askForBuffer = commandOptions({ returnBuffers: true })

  constructor() {
    super()
    this.#redis = getRedis()
  }

  #parseSession<TDoc>(_session: Buffer): TDoc | undefined {
    const session = BSON.deserialize(Uint8Array.from(_session))
    return session as TDoc
  }

  #key(key: SessionIdType<TDoc>): KeyOf<TDoc> {
    return (RedisSessionStore.REDIS_SESSION_PREFIX + key) as KeyOf<TDoc>
  }

  #indexKey(userId: string): string {
    return RedisSessionStore.REDIS_SESSION_INDEX_PREFIX + userId
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
    const ttl = sessionConfig.expire / 1000

    const multi = this.#redis.multi()
      .set(key, Buffer.from(stream), { EX: ttl })

    // Only user-bound sessions are indexed; anonymous ones are the bulk of the
    // keyspace and are never looked up by user. The index expires with the
    // sessions it points at.
    if (value.userId) {
      const index = this.#indexKey(String(value.userId))
      multi.sAdd(index, this.#removePrefix(key)).expire(index, ttl)
    }

    await multi.exec()
    return key
  }

  async set(key: SessionIdType<TDoc>, value: TDoc): Promise<[SessionIdType<TDoc>, TDoc]> {
    return [this.#removePrefix(await this.#set(this.#key(key), value)), value]
  }

  async #destroy(key: KeyOf<TDoc>): Promise<boolean> {
    // Read first: the index entry is keyed by user, and a login can rebind an
    // existing session to another user.
    const session = await this.#get(key)
    const removed = await this.#redis.del(key)

    if (session?.userId) {
      await this.#redis.sRem(this.#indexKey(String(session.userId)), this.#removePrefix(key))
    }

    return !!removed
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

  /**
   * Sessions of one user, via the index: one SMEMBERS, then a GET per session
   * (a handful per user, versus the millions of anonymous keys a SCAN walks).
   * Entries that expired, or that a later login rebound to another user, are
   * pruned from the index on the way out.
   */
  async #findByUser(userId: string): Promise<Record<string, TDoc>> {
    const index = this.#indexKey(userId)
    const ids = await this.#redis.sMembers(index)

    if (!ids.length) {
      return {}
    }

    const raw = await Promise.all(
      ids.map(id => this.#get(this.#key(id as SessionIdType<TDoc>))),
    )
    const found: Record<string, TDoc> = {}
    const stale: string[] = []

    ids.forEach((id, i) => {
      const session = raw[i]

      if (!session || String(session.userId) !== userId) {
        stale.push(id)
        return
      }

      found[id] = session
    })

    if (stale.length) {
      await this.#redis.sRem(index, stale)
    }

    return found
  }

  async findAll(query: any): Promise<Record<SessionIdType<TDoc>, TDoc>> {
    // Filtering by user is what session revocation and the settings page need;
    // it must not scan the whole keyspace.
    if (query?.userId && !query?.OS) {
      return await this.#findByUser(String(query.userId)) as Record<SessionIdType<TDoc>, TDoc>
    }

    const returnValue = {} as Record<SessionIdType<TDoc>, TDoc>

    await this.forEach((val, key) => {
      if (match(val).deepSome(query)) {
        returnValue[key] = val
      }
    })

    return returnValue
  }
}
