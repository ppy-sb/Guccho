import * as trpc from '@trpc/server'
import type { inferAsyncReturnType } from '@trpc/server'
import { type H3Event, parseCookies } from 'h3'
import { ServerRulesetConfig } from '../config'

// routers
import { router as rUser } from './routers/user'
import { router as rSession } from './routers/session'
import { router as rMe } from './routers/me'

// The app's context - is generated for each incoming request
export function createContext (e: H3Event) {
  const cookies = parseCookies(e)
  return {
    session: {
      id: cookies.session as string | undefined
    },
    h3Event: e
  }
}
export type Context = inferAsyncReturnType<typeof createContext>

export const router =
trpc.router<Context>()
  .merge('session.', rSession)
  .merge('me.', rMe)

  // public
  .merge('public.user.', rUser)

  // TODO
  .query('ranking-system-config', {
    resolve () {
      return ServerRulesetConfig
    }
  })

  .query('server-has-owner', {
    resolve () {
      return false
    }
  })
