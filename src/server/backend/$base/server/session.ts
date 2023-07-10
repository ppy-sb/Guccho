import { v4 } from 'uuid'
import { match } from 'switch-pattern'
import { Logger } from '$base/log'
import { Client, OS } from '~/def/device'

const logger = Logger.child({ label: 'session' })

export interface SessionBase<UserIdType = string> {
  userId?: UserIdType
  lastActivity: Date
  OS: OS
}

export interface SessionBrowser {
  client: Client.Browser
  browser: string
}
export interface SessionOsuClient {

  client: Client.OsuStableClient
  version: string
}
export interface SessionUnknown {
  client: Client.Unknown
}

export type SessionClient = SessionBrowser | SessionOsuClient | SessionUnknown

export type Session<T = string> = SessionBase<T> & SessionClient

export interface SessionStore<TSessionId extends string | symbol, TSession extends Session<any>> {
  get(key: TSessionId): PromiseLike<TSession | undefined>
  set(key: TSessionId, value: TSession): PromiseLike<TSessionId>
  destroy(key: TSessionId): PromiseLike<boolean>
  forEach(cb: (session: TSession, id: TSessionId) => void | PromiseLike<void>): PromiseLike<void>
  findAll(query: Pick<TSession, 'OS' | 'userId'>): PromiseLike<Record<TSessionId, TSession>>
}
export const config = {
  expire: 1000 * 60 * 60,
}

// const store = new Map<any, any>()
let store: Map<any, any>
function createStoreSingleton<TSessionId extends string | symbol, TSession extends Session<string>>() {
  logger.warn('Warn: You are using memory session store.')
  store = new Map<TSessionId, TSession>()
}
export function createSessionStore<TSessionId extends string | symbol, TSession extends Session<string>>(): SessionStore<TSessionId, TSession> {
  if (!store) {
    createStoreSingleton<TSessionId, TSession>()
  }

  const typedStore = store as Map<TSessionId, TSession>
  return {
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
    async findAll(query) {
      return Object.fromEntries([...typedStore.entries()].filter(([_, s]) => match(s).deepSome(query))) as Record<TSessionId, TSession>
    },
  } satisfies SessionStore<TSessionId, TSession>
}

export class SessionProvider<TSessionId extends string | symbol, TSession extends Session<any>> {
  houseKeeping: Partial<Record<'minutely' | 'hourly' | 'daily', (store: SessionStore<TSessionId, TSession>, _config: typeof config) => PromiseLike<void>>> = {
    minutely: async (sessionStore) => {
      sessionStore.forEach((session, sessionId) => this.removeIfExpired(session, sessionId))
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

  async create(data: Omit<Session, 'lastActivity'>) {
    const sessionId = v4() as TSessionId

    const _session = {
      ...data,
      lastActivity: new Date(),
    } as TSession
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

  expired(session: Session) {
    return Date.now() - session.lastActivity.getTime() > config.expire
  }

  async update(sessionId: TSessionId, data: Partial<Session>) {
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

  async removeIfExpired(session: Session, sessionId: TSessionId) {
    if (this.expired(session)) {
      this.destroy(sessionId)
    }
  }
}
