import { type H3Event } from 'h3'
import type { inferAsyncReturnType } from '@trpc/server'
export function createContext(e: H3Event) {
  const session = getCookie(e, 'session')
  return {
    session: {
      id: session,
    },
    h3Event: e,
  }
}
export type Context = inferAsyncReturnType<typeof createContext>
