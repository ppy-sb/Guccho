import type { H3Event } from 'h3'
import { loggedIn } from './1.user'
import { haveSession } from './0.session'
import { type UserCompact, UserRole } from '~/def/user'
import type { Id } from '$active'
import type { Session } from '$base/server/session'

export default defineEventHandler(async (event) => {
  sideEffect(event)
})

export function sideEffect(event: H3Event) {
  if (!haveSession(event) || !loggedIn(event)) {
    return
  }
  if (isAdmin(event)) {
    event.context.isAdmin = true
  }
}

export function assertIsAdmin(event: H3Event & { context: { session: Session<any>; user: UserCompact<Id> } }): asserts event is typeof event & { context: { user: UserCompact<Id> & { roles: [...UserRole[], UserRole.Staff] } } } {
  isAdmin(event) || raise(Error, 'not admin')
}

export function isAdmin(event: H3Event & { context: { session: Session<any>; user: UserCompact<Id> } }): event is typeof event & { context: { user: UserCompact<Id> & { roles: [...UserRole[], UserRole.Staff] } } } {
  return !!event.context.user.roles.includes(UserRole.Staff)
}
