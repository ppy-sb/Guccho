import { TRPCError } from '@trpc/server'
import { createRouterWithSession } from '../session'

import { getBaseUser } from '../../../backend-clients/user'

export function createProtectedRouter () {
  return createRouterWithSession()
    .middleware(async ({ ctx, next }) => {
      const session = await ctx.session.getBinding()
      if (!session) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'cannot retrieve session'
        })
      }
      if (!session.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'you need to login first'
        })
      }
      const user = await getBaseUser(session.userId)
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'user not found'
        })
      }
      return next({
        ctx: {
          ...ctx,
          user
        }
      })
    })
}
