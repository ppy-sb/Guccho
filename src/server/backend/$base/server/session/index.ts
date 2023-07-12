import { v4 } from 'uuid'
import type { SessionStore } from './session-store'
import { MemorySessionStore } from './session-store'
import { Logger } from '$base/log'
import type { Client, OS } from '~/def/device'

export const logger = Logger.child({ label: 'session' })

export interface SessionBase<UserIdType = string> {
  userId?: UserIdType
  lastSeen: Date
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

export abstract class SessionProvider<TSessionId extends string, TSession extends Session<any>> {
  store: SessionStore<TSessionId, TSession>

  abstract prepare(): SessionStore<TSessionId, TSession>

  constructor() {
    this.store = this.prepare()
  }

  async create(data: Omit<Session, 'lastSeen'>) {
    const sessionId = v4() as TSessionId

    const _session = {
      ...data,
      lastSeen: new Date(),
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
    _session.lastSeen = new Date()
    this.store.set(sessionId, _session)
    return sessionId
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
    newSession.lastSeen = new Date()
    const maybeNewSessionId = await this.store.set(sessionId, newSession)
    return maybeNewSessionId
  }
}

const s = lazySingleton(<TSessionId extends string, TSession extends Session>() => new MemorySessionStore<TSessionId, TSession>())
export class MemorySessionProvider<TSessionId extends string, TSession extends Session<any>> extends SessionProvider<TSessionId, TSession> implements SessionProvider<TSessionId, TSession> {
  prepare() {
    return s<TSessionId, TSession>()
  }
}
