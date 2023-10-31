import { TRPCError } from '@trpc/server'
import {
  unableToRetrieveSession,
  userNotFound,
  youNeedToLogin,
} from '../messages'
import { sessionProcedure } from './session'
import { users } from '~/server/singleton/service'
import { UserProvider } from '$active/server'

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
  const user = await users.getCompactById({ id: UserProvider.stringToId(session.userId) })
  if (user == null) {
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
