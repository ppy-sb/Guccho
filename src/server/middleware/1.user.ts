import type { H3Event } from 'h3'
import { haveSession } from './0.session'
import type { Id } from '$active'
import { UserProvider, users } from '~/server/singleton/service'
import type { Session } from '$base/server/session'
import type { UserCompact } from '~/def/user'

export default defineEventHandler(async (event) => {
  await sideEffect(event)
})

export async function sideEffect(event: H3Event) {
  if (!haveSession(event)) {
    return
  }
  if (event.context.user) {
    return
  }
  if (!event.context.session.userId) {
    return
  }
  const user = await users.getCompactById({ id: UserProvider.stringToId(event.context.session.userId) }).catch(noop)
  if (!user) {
    return
  }
  event.context.user = user
}

export function assertLoggedIn(event: H3Event & { context: { session: Session<any> } }): asserts event is typeof event & { context: { user: UserCompact<Id> } } {
  loggedIn(event) || raise(Error, 'no session')
}

export function loggedIn(event: H3Event & { context: { session: Session<any> } }): event is typeof event & { context: { user: UserCompact<Id> } } {
  return !!event.context.user
}
