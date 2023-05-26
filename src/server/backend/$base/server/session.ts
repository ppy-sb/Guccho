import { v4 } from 'uuid'
import { Logger } from '~/server/backend/$base/log'

const logger = Logger.child({ label: 'session' })

export interface Session<Id = string> {
  userId?: Id
  lastActivity: Date
}

export interface SessionStore<TSessionId, TSession> {
  get(key: TSessionId): PromiseLike<TSession | undefined>
  set(key: TSessionId, value: TSession): PromiseLike<TSessionId>
  destroy(key: TSessionId): PromiseLike<boolean>
  forEach(cb: (arg0: TSession, arg1: TSessionId) => PromiseLike<void>): PromiseLike<void>
}
export const config = {
  expire: 1000 * 60 * 60,
}

// const store = new Map<any, any>()
let store: Map<any, any>
function createStoreSingleton<TSessionId, TSession>() {
  logger.warn('Warn: You are using memory session store.')
  store = new Map<TSessionId, TSession>()
}
export function createSessionStore<TSessionId, TSession>() {
  if (!store) {
    createStoreSingleton<TSessionId, TSession>()
  }

  const typedStore = <Map<TSessionId, TSession>>store
  return <SessionStore<TSessionId, TSession>>{
    async get(key: TSessionId) {
      return typedStore.get(key)
    },
    async set(key: TSessionId, value: TSession) {
      typedStore.set(key, value)
      return key
    },
    async destroy(key: TSessionId) {
      return typedStore.delete(key)
    },
    async forEach(cb) {
      return typedStore.forEach(cb)
    },
  }
}

export class SessionProvider<TSessionId, TSession extends Session> {
  houseKeeping: Partial<Record<'minutely' | 'hourly' | 'daily', (store: SessionStore<TSessionId, TSession>, _config: typeof config) => PromiseLike<void>>> = {
    minutely: async (sessionStore) => {
      sessionStore.forEach((a, b) => this.removeIfExpired(a, b))
    },
  }

  store: SessionStore<TSessionId, TSession>
  constructor() {
    this.store = this.prepareStore()
    setInterval(() => this.houseKeeping.minutely?.call(this, this.store, config), 1000 * 60)
    setInterval(() => this.houseKeeping.hourly?.call(this, this.store, config), 1000 * 60 * 60)
    setInterval(() => this.houseKeeping.daily?.call(this, this.store, config), 1000 * 60 * 60 * 24)
  }

  prepareStore() {
    return createSessionStore<TSessionId, TSession>()
  }

  async create(data?: { id: string }) {
    const sessionId = <TSessionId>v4()
    const _session = <TSession>{
      userId: data?.id,
      lastActivity: new Date(),
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
    if (!_session) {
      return
    }
    _session.lastActivity = new Date()
    this.store.set(sessionId, _session)
    return sessionId
  }

  expired(session: TSession) {
    return Date.now() - session.lastActivity.getTime() > config.expire
  }

  async update(sessionId: TSessionId, data: Partial<TSession>) {
    const _session = await this.store.get(sessionId)
    if (!_session) {
      return undefined
    }
    const newSession = {
      ..._session,
      ...data,
    }
    newSession.lastActivity = new Date()
    const maybeNewSessionId = await this.store.set(sessionId, newSession)
    return maybeNewSessionId
  }

  async removeIfExpired(session: TSession, sessionId: TSessionId) {
    if (this.expired(session)) {
      this.destroy(sessionId)
    }
  }
}
