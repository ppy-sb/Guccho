import { GucchoError } from '../messages'
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
    throwGucchoError(GucchoError.RequireAdminPrivilege)
  }
  return next()
})
