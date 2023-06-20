import { type H3Event } from 'h3'
import type { inferAsyncReturnType } from '@trpc/server'

// type _ReturnType = Awaited<ReturnType<typeof getSession>> & Record<string, unknown>
export function createContext(e: H3Event) {
  const session = getCookie(e, 'session')
  return {
    session: {
      id: session,
    },
    h3Event: e,
  }
  // as {
  //   session: {
  //     id?: string
  //     getBinding?(): _ReturnType
  //   }
  //   user?: UserEssential<unknown>
  //   h3Event: H3Event
  // }
}
export type Context = inferAsyncReturnType<typeof createContext>
