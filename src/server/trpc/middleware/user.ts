import { GucchoError } from '../messages'
import { sessionProcedure } from './session'
import { UserProvider, users } from '~/server/singleton/service'

export const userProcedure = sessionProcedure.use(async ({ ctx, next }) => {
  const session = await ctx.session.getBinding()
  if (!session) {
    throwGucchoError(GucchoError.UnableToRetrieveSession)
  }

  if (!session.userId) {
    throwGucchoError(GucchoError.YouNeedToLogin)
  }
  const user = await users.getCompactById({ id: UserProvider.stringToId(session.userId) }).catch(noop)
  if (!user) {
    throwGucchoError(GucchoError.UserNotFound)
  }
  return await next({
    ctx: {
      ...ctx,
      user,
    },
  })
})
