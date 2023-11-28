import { TRPCError } from '@trpc/server'
import {
  unableToRetrieveSession,
  userNotFound,
  youNeedToLogin,
} from '../messages'
import { sessionProcedure } from './session'
import { UserProvider, users } from '~/server/singleton/service'

export const userProcedure = sessionProcedure.use(async ({ ctx, next }) => {
  const session = await ctx.session.getBinding()
  if (!session) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: unableToRetrieveSession,
    })
  }
  if (!session.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: youNeedToLogin,
    })
  }
  const user = await users.getCompactById({ id: UserProvider.stringToId(session.userId) }).catch(noop)
  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: userNotFound,
    })
  }
  return await next({
    ctx: {
      ...ctx,
      user,
    },
  })
})
