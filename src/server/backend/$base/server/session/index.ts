import { v4 } from 'uuid'
import { MemorySessionStore, type SessionStore } from './session-store'
import { Logger } from '$base/logger'
import type { Client, OS } from '~/def/device'

export const logger = Logger.child({ label: 'session' })

export interface SessionBase<UserIdType = string> extends Record<string, unknown> {
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
export type SessionIdType<T extends Session> = T extends Session<infer R> ? R : never

export abstract class SessionProvider<TSession extends Session<string>> {
  store: SessionStore<TSession>

  abstract prepare(): SessionStore<TSession>

  constructor() {
    this.store = this.prepare()
  }

  async create(data: Omit<Session, 'lastSeen'>) {
    const sessionId = v4() as SessionIdType<TSession>

    const _session = {
      ...data,
      lastSeen: new Date(),
    } as TSession
    await this.store.set(sessionId, _session)
    return sessionId
  }

  async get(sessionId: SessionIdType<TSession>) {
    const _session = await this.store.get(sessionId)
    if (!_session) {
      return undefined
    }

    return _session
  }

  async destroy(sessionId: SessionIdType<TSession>) {
    await this.store.destroy(sessionId)
  }

  async refresh(sessionId: SessionIdType<TSession>) {
    const _session = await this.store.get(sessionId)
    if (!_session) {
      return
    }
    _session.lastSeen = new Date()
    this.store.set(sessionId, _session)
    return sessionId
  }

  async update(sessionId: SessionIdType<TSession>, data: Partial<Session>) {
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

const s = lazySingleton(<TSession extends Session<any>>() => new MemorySessionStore<TSession>())
export class MemorySessionProvider<TSession extends Session<any>> extends SessionProvider<TSession> implements SessionProvider<TSession> {
  prepare() {
    return s<TSession>()
  }
}
