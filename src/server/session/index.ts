import { v4 } from 'uuid'

import type { Id } from '$active'
import type { Awaitable } from '~/types/common'

export const session = new Map<string, { userId?: Id; lastActivity: number }>()
export const config = {
  expire: 1000 * 60 * 60,
}

export const createSession = async (data?: { id: Id }) => {
  const sessionId = v4()
  const _session = {
    userId: data?.id,
    lastActivity: Date.now(),
  }
  session.set(sessionId, _session)
  return sessionId
}

export const getSession = async (sessionId: string) => {
  const _session = session.get(sessionId)
  if (_session == null) {
    return undefined
  }
  if (Date.now() - _session.lastActivity > config.expire) {
    session.delete(sessionId)
  }

  return _session
}

export const refresh = async (sessionId: string) => {
  const _session = session.get(sessionId)
  if (_session == null) {
    return
  }
  _session.lastActivity = Date.now()
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
