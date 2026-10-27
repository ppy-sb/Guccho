import { v4 } from 'uuid'
import { MemorySessionStore, type SessionStore } from './session-store'
import { Logger } from '$base/logger'
import type { Client, OS } from '~/def/device'
import { GucchoError } from '~/def/messages'

export const logger = Logger.child({ label: 'session' })

export interface SessionBase<UserIdType = string> extends Record<string, unknown> {
  userId?: UserIdType
  lastSeen: Date
  OS: OS
  client: Client
  memo?: string
}

export interface SessionBrowser {
  client: Client.Browser
  browser: string
}
// export interface SessionOsuClient {

//   client: Client.OsuStableClient
//   version: string
// }

export interface SessionUnknown {
  client: Client.Unknown
}

export type Session<T = string> = SessionBase<T> & (SessionBrowser | SessionUnknown)
export type SessionIdType<T extends Session> = T extends Session<infer R> ? R : never

export abstract class SessionProvider<TSession extends Session<string>> {
  store: SessionStore<TSession>

  abstract prepare(): SessionStore<TSession>

  constructor() {
    this.store = this.prepare()
  }

  /**
   * @deprecated this is internal method, use session binding when possible. Will update immediately
   * @internal
   * @private
   */
  async create(data: Omit<Session, 'lastSeen'>): Promise<[SessionIdType<TSession>, Readonly<TSession>]> {
    const sessionId = v4() as SessionIdType<TSession>

    const _session = {
      ...data,
      lastSeen: new Date(),
    } as TSession

    await this.store.set(sessionId, _session)
    return [sessionId, _session]
  }

  /**
   * @deprecated this is internal method, use session binding when possible. Will fetch immediately.
   * @internal
   * @private
   */
  async get(sessionId: SessionIdType<TSession>) {
    return await this.store.get(sessionId)
  }

  /**
   * @deprecated this is internal method, use session binding when possible. Will delete session immediately.
   * @internal
   * @private
   */
  async destroy(sessionId: SessionIdType<TSession>) {
    await this.store.destroy(sessionId)
  }

  /**
   * Destroy every session bound to a user, so a stolen cookie cannot outlive the
   * credential it was obtained with. `except` keeps the caller's own session.
   */
  async destroyAllForUser(userId: string, { except }: { except?: string } = {}) {
    const found = await this.store.findAll({ userId })
    const ids = Object.keys(found).filter(id => id !== except) as SessionIdType<TSession>[]
    await Promise.all(ids.map(id => this.store.destroy(id)))
    return ids.length
  }

  /**
   * @deprecated this is internal method, use session binding when possible. Will update immediately.
   * @internal
   * @private
   */
  async refresh(sessionId: SessionIdType<TSession>): Promise<[SessionIdType<TSession>, TSession] | undefined> {
    const _session = ({ ...await this.store.get(sessionId) }) as TSession
    if (!_session) {
      return
    }
    _session.lastSeen = new Date()
    this.store.set(sessionId, _session)
    return [sessionId, _session]
  }

  /**
   * @deprecated this is internal method, use session binding when possible. Will update immediately
   * @internal
   * @private
   */
  async update(sessionId: SessionIdType<TSession>, data: Partial<Session>) {
    const _session = await this.store.get(sessionId)
    if (!_session) {
      throwGucchoError(GucchoError.SessionNotFound)
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
