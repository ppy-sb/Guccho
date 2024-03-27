import type { H3Event } from 'h3'
import { Constant } from '~/server/common/constants'
import type { Session } from '$base/server/session'
import { sessions } from '~/server/singleton/service'

export default defineEventHandler(async (event) => {
  await sideEffect(event)
})

export async function sideEffect(event: H3Event) {
  const cookie = getCookie(event, Constant.SessionLabel)
  const persist = !!getCookie(event, Constant.Persist)

  if (!cookie) {
    return
  }
  const opts = {
    httpOnly: true,
    maxAge: persist ? Constant.PersistDuration as number : undefined,
  }
  const refreshed = await sessions.refresh(cookie)
  if (refreshed) {
    setCookie(event, Constant.SessionLabel, refreshed, opts)
  }
  if (persist) {
    setCookie(event, Constant.Persist, 'yes', opts)
  }
  event.context.session = await sessions.get(cookie)
}

export function assertHaveSession(event: H3Event): asserts event is typeof event & { context: { session: Session } } {
  haveSession(event) || raise(Error, 'no session')
}

export function haveSession(event: H3Event): event is typeof event & { context: { session: Session } } {
  return !!event.context.session
}
