import { v4 } from 'uuid'

import type { Id } from '$active'
import type { Awaitable } from '~/types/common'

type inferMapType<T> = T extends Map<infer K, infer U> ? [K, U] : never

export const session = new Map<string, { userId?: Id; lastActivity: number }>()
export const config = {
  expire: 1000 * 60 * 60,
}

export async function createSession(data?: { id: Id }) {
  const sessionId = v4()
  const _session = {
    userId: data?.id,
    lastActivity: Date.now(),
  }
  session.set(sessionId, _session)
  return sessionId
}

export async function getSession(sessionId: string) {
  const _session = session.get(sessionId)
  if (_session == null) {
    return undefined
  }
  if (Date.now() - _session.lastActivity > config.expire) {
    session.delete(sessionId)
  }

  return _session
}

export async function refresh(sessionId: string) {
  const _session = session.get(sessionId)
  if (_session == null) {
    return
  }
  _session.lastActivity = Date.now()
  return sessionId
}

export async function updateSession(sessionId: string, data: Partial<inferMapType<typeof session>[1]>) {
  const _session = session.get(sessionId)
  if (_session == null) {
    return undefined
  }
  const newSession = {
    ..._session,
    ...data,
  }
  newSession.lastActivity = Date.now()
  session.set(sessionId, newSession)
  return sessionId
}

export const houseKeeping: Record<
  string,
  (store: typeof session, _config: typeof config) => Awaitable<void>
> = {
  minutely(sessionStore, config) {
    sessionStore.forEach(({ lastActivity }, sessionId) => {
      if (lastActivity + config.expire > Date.now()) {
        return
      }

      sessionStore.delete(sessionId)
    })
  },
}

setInterval(() => houseKeeping.minutely?.(session, config), 1000 * 60)
