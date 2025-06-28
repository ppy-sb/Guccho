import { sessionProcedure } from './session'
import type { UserCompact } from '~/def/user'
import { UserProvider } from '~/server/singleton/service'

const userProvider = new UserProvider()
export const optionalUserProcedure = sessionProcedure.use(async ({ ctx, next }) => {
  type ReturnCTX = typeof ctx & { user?: UserCompact<string> }
  const session = await ctx.session.getBinding()
  if (!session) {
    return await next<ReturnCTX>(undefined as any)
  }
  if (!session.userId) {
    return await next<ReturnCTX>(undefined as any)
  }
  const user = await userProvider
    .getCompactById(UserProvider.stringToId(session.userId))
    .catch(noop<undefined>)

  ;(ctx as ReturnCTX).user = user ? mapId(user, UserProvider.idToString) : undefined
  return await next<ReturnCTX>({ ctx })
})
