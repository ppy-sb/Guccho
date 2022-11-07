/* eslint-disable require-await */
import { v4 } from 'uuid'
import { IdType } from '../config'
import { Awaitable } from '~~/src/types/shared'

export const session = new Map<string, {userId?: IdType, lastActivity: number}>()
export const config = {
  expire: 1000 * 60 * 60
}

export const createSession = async (data?: {id: IdType}) => {
  const sessionId = v4()
  const _session = {
    userId: data?.id,
    lastActivity: Date.now()
  }
  session.set(sessionId, _session)
  return sessionId
}

export const getSession = async (sessionId: string) => {
  const _session = session.get(sessionId)
  if (!_session) { return undefined }
  if ((Date.now() - _session.lastActivity) > config.expire) {
    session.delete(sessionId)
  }
  return _session
}

export const refresh = async (sessionId: string) => {
  const _session = session.get(sessionId)
  if (!_session) { return }
  _session.lastActivity = Date.now()
  return sessionId
}

export const houseKeeping:Record<string, (store: typeof session, _config: typeof config) => Awaitable<void>> = {
  minutely (sessionStore, config) {
    sessionStore.forEach(({ lastActivity }, sessionId) => {
      if (lastActivity + config.expire > Date.now()) {
        return
      }
      console.log('cleaning session', sessionId)
      sessionStore.delete(sessionId)
    })
  }
}

setInterval(() => houseKeeping.minutely?.(session, config), 1000 * 60)
