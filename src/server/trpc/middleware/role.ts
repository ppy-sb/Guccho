import { userProcedure } from './user'
import { UserRole } from '~/def/user'
import { GucchoError } from '~/def/messages'

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

export const staffProcedure = roleProcedure.use(({ ctx, next }) => {
  if (!ctx.user.role.staff) {
    throwGucchoError(GucchoError.RequireAdminPrivilege)
  }
  return next()
})

export const adminProcedure = roleProcedure.use(({ ctx, next }) => {
  if (!ctx.user.role.admin) {
    throwGucchoError(GucchoError.RequireAdminPrivilege)
  }
  return next()
})

export const ownerProcedure = roleProcedure.use(({ ctx, next }) => {
  if (!ctx.user.role.owner) {
    throwGucchoError(GucchoError.RequireAdminPrivilege)
  }
  return next()
})

export const bNProcedure = userProcedure.use(({ ctx, next }) => {
  const isBN = ctx.user.roles.includes(UserRole.BeatmapNominator)
  if (!isBN) {
    throwGucchoError(GucchoError.RequireAdminPrivilege)
  }
  return next()
})
