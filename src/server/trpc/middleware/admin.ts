import { TRPCError } from '@trpc/server'
import { userProcedure } from './user'
import { checkUserPrivilege } from '~/helpers/checkUserPrivilege'

export const privilegeProcedure = userProcedure
  .use(async ({ ctx, next }) => {
    const privilege = checkUserPrivilege(ctx.user)

    return next({
      ctx: {
        ...ctx,
        user: {
          ...ctx.user,
          privilege,
        },
      },
    })
  })

export const adminProcedure = privilegeProcedure
  .use(({ ctx, next }) => {
    if (!ctx.user.privilege.hasAdminAccess)
      throw new TRPCError({ code: 'FORBIDDEN', message: 'you do not have sufficient privilege to interact with this page.' })
    return next()
  })
