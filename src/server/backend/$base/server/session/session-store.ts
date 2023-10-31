import { match } from 'switch-pattern'
import { Monitored } from '../@extends'
import { type Session, logger } from '.'

export const sessionConfig = {
  expire: 1000 * 60 * 60 * 24, // 1D
}

export abstract class SessionStore<TSessionId extends string, TSession extends Session<string>> implements Monitored {
  abstract [Monitored.status]: Monitored[typeof Monitored.status]
  abstract get(key: TSessionId): PromiseLike<TSession | undefined>
  abstract set(key: TSessionId, value: TSession): PromiseLike<TSessionId>
  abstract destroy(key: TSessionId): PromiseLike<boolean>
  abstract forEach(cb: (session: TSession, id: TSessionId) => void | PromiseLike<void>): PromiseLike<void>
  abstract findAll(query: Partial<Pick<TSession, 'OS' | 'userId'>>): PromiseLike<Record<TSessionId, TSession>>
}

export abstract class HouseKeeperSession<TSessionId extends string, TSession extends Session<string>> extends SessionStore<TSessionId, TSession> implements SessionStore<TSessionId, TSession> {
  #houseKeeping: Partial<Record<'minutely' | 'hourly' | 'daily', (store: SessionStore<TSessionId, TSession>, _config: typeof sessionConfig) => PromiseLike<void>>> = {
    async minutely(this: MemorySessionStore<TSessionId, TSession>, sessionStore) {
      sessionStore.forEach((session, sessionId) => this.#removeIfExpired(session, sessionId))
    },
  }

  constructor() {
    super()
    setInterval(() => this.#houseKeeping.minutely?.call(this, this, sessionConfig), 1000 * 60)
    setInterval(() => this.#houseKeeping.hourly?.call(this, this, sessionConfig), 1000 * 60 * 60)
    setInterval(() => this.#houseKeeping.daily?.call(this, this, sessionConfig), 1000 * 60 * 60 * 24)
  }

  async #removeIfExpired(session: Session, sessionId: TSessionId) {
    if (this.#expired(session)) {
      this.destroy(sessionId)
    }
  }

  #expired(session: Session) {
    return Date.now() - session.lastSeen.getTime() > sessionConfig.expire
  }
}

export class MemorySessionStore<TSessionId extends string, TSession extends Session<string>> extends HouseKeeperSession<TSessionId, TSession> implements HouseKeeperSession<TSessionId, TSession> {
  private store: Map<TSessionId, TSession>

  [Monitored.status]: Monitored[typeof Monitored.status] = [Monitored.Status.Up, 'Memory Session driver']

  constructor() {
    super()
    logger.warn('Warn: You are using memory session store.')
    this.store = new Map<TSessionId, TSession>()
  }

  async get(key: TSessionId): Promise<TSession | undefined> {
    return this.store.get(key)
  }

  async set(key: TSessionId, value: TSession): Promise<TSessionId> {
    this.store.set(key, value)
    return key
  }

  async destroy(key: TSessionId): Promise<boolean> {
    return this.store.delete(key)
  }

  async forEach(cb: (session: TSession, id: TSessionId) => void | PromiseLike<void>): Promise<void> {
    return this.store.forEach(cb)
  }

  async findAll(query: Partial<Pick<TSession, 'OS' | 'userId'>>): Promise<Record<TSessionId, TSession>> {
    return Object.fromEntries([...this.store.entries()].filter(([_, s]) => match(s).deepSome(query))) as Record<TSessionId, TSession>
  }
}
