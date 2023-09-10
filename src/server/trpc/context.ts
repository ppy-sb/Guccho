import { type H3Event } from 'h3'
import type { inferAsyncReturnType } from '@trpc/server'
import { Constant } from '../common/constants'

// type _ReturnType = Awaited<ReturnType<typeof getSession>> & Record<string, unknown>
export function createContext(e: H3Event) {
  const session = getCookie(e, Constant.SessionLabel)
  return {
    session: {
      id: session,
    },
    h3Event: e,
  }
}
export type Context = inferAsyncReturnType<typeof createContext>
