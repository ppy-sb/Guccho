/* eslint-disable require-await */
import { v4 } from 'uuid'
import { IdType } from '../config'

export const session = new Map<string, {userId?: IdType, lastActivity: number}>()
export const config = {
  expire: 1000 * 60 * 60
}

export const createSession = async (data?: {id: IdType}) => {
  const sessionId = v4()
  session.set(sessionId, {
    userId: data?.id,
    lastActivity: Date.now()
  })
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
