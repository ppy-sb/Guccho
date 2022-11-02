import { v4 } from 'uuid'
import { IdType } from '../config'

export const session = new Map<string, {userId: IdType, lastActivity: number}>()
export const config = {
  expire: 1000 * 60 * 60
}

export const createSession = ({ id }: {id: IdType}) => {
  const sessionId = v4()
  session.set(sessionId, {
    userId: id,
    lastActivity: Date.now()
  })
  return sessionId
}
export const getSession = (sessionId: string) => {
  const _session = session.get(sessionId)
  if (!_session) { return undefined }
  if ((Date.now() - _session.lastActivity) > config.expire) {
    session.delete(sessionId)
  }
  return _session
}
export const refresh = (sessionId: string) => {
  const _session = session.get(sessionId)
  if (!_session) { return }
  _session.lastActivity = Date.now()
  return sessionId
}
