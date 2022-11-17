import { type H3Event, parseCookies } from 'h3'
import { inferAsyncReturnType } from '@trpc/server'
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
