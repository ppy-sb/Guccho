import { TRPCError } from '@trpc/server'
import { userProcedure } from './user'

export const roleProcedure = userProcedure.use(async ({ ctx, next }) => {
  const role = computeUserRoles(ctx.user)

  return next({
    ctx: {
      ...ctx,
      user: {
        ...ctx.user,
        role,
      },
    },
  })
})

export const adminProcedure = roleProcedure.use(({ ctx, next }) => {
  if (!ctx.user.role.staff) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message:
        'you do not have sufficient privilege to interact with this page.',
    })
  }
  return next()
})
