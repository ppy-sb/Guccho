import { v4 } from 'uuid'

import type { Awaitable } from '~/types/common'

// type inferMapType<T> = T extends Map<infer K, infer U> ? [K, U] : never
export interface Session<Id = string> {
  userId?: Id
  lastActivity: number
}

export interface SessionStore<TSessionId, TSession> {
  get(key: TSessionId): Promise<TSession | undefined>
  set(key: TSessionId, value: TSession): Promise<void>
  destroy(key: TSessionId): Promise<boolean>
  forEach(cb: (arg0: TSession, arg1: TSessionId) => Promise<void>): Promise<void>
}
export const config = {
  expire: 1000 * 60 * 60,
}

function createSessionStore<TSessionId, TSession>() {
  const store = new Map<TSessionId, TSession>()
  return <SessionStore<TSessionId, TSession>>{
    async get(key: TSessionId) {
      return store.get(key)
    },
    async set(key: TSessionId, value: TSession) {
      store.set(key, value)
    },
    async destroy(key: TSessionId) {
      return store.delete(key)
    },
    async forEach(cb) {
      return store.forEach(cb)
    },
  }
}

export class SessionProvider<TSessionId, TSession extends Session> {
  houseKeeping: Partial<Record<'minutely' | 'hourly' | 'daily', (store: SessionStore<TSessionId, TSession>, _config: typeof config) => Awaitable<void>>> = {
    minutely: (sessionStore) => {
      sessionStore.forEach((a, b) => this.removeIfExpired(a, b))
    },
  }

  store: SessionStore<TSessionId, TSession> = createSessionStore()
  constructor() {
    setInterval(() => this.houseKeeping.minutely?.(this.store, config), 1000 * 60)
  }

  async create(data?: { id: string }) {
    const sessionId = <TSessionId>v4()
    const _session = <TSession>{
      userId: data?.id,
      lastActivity: Date.now(),
    }
    await this.store.set(sessionId, _session)
    return sessionId
  }

  async get(sessionId: TSessionId) {
    const _session = await this.store.get(sessionId)
    if (!_session) {
      return undefined
    }

    return _session
  }

  async destroy(sessionId: TSessionId) {
    await this.store.destroy(sessionId)
  }

  async refresh(sessionId: TSessionId) {
    const _session = await this.store.get(sessionId)
    if (_session == null) {
      return
    }
    _session.lastActivity = Date.now()
    return sessionId
  }

  expired(session: TSession) {
    return Date.now() - session.lastActivity > config.expire
  }

  async update(sessionId: TSessionId, data: Partial<TSession>) {
    const _session = await await this.store.get(sessionId)
    if (!_session) {
      return undefined
    }
    const newSession = {
      ..._session,
      ...data,
    }
    newSession.lastActivity = Date.now()
    await this.store.set(sessionId, newSession)
    return sessionId
  }

  async removeIfExpired(session: TSession, sessionId: TSessionId) {
    if (this.expired(session)) {
      this.destroy(sessionId)
    }
  }
}
