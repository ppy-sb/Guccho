import { sessionProcedure } from './session'
import type { UserEssential } from '~/types/user'
import { UserProvider } from '$active/server'

const userProvider = new UserProvider()
export const optionalUserProcedure = sessionProcedure.use(async ({ ctx, next }) => {
  const merge: { user?: UserEssential<unknown> } = {}
  const returnCtx = Object.assign(ctx, merge)
  const session = await ctx.session.getBinding()
  if (!session) {
    return await next({ ctx: returnCtx })
  }
  if (!session.userId) {
    return await next({ ctx: returnCtx })
  }
  const user = await userProvider.getEssentialById({ id: session.userId }).catch(_ => undefined)
  returnCtx.user = user
  return await next({ ctx: returnCtx })
})
