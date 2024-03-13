import { TRPCError } from '@trpc/server'
import { boolean, object, string } from 'zod'
import {
  GucchoError,
} from '../messages'
import { sessionProcedure as pSession } from '../middleware/session'
import { zodHandle } from '../shapes'
import { router as _router, publicProcedure } from '../trpc'
import { UserProvider, sessions, users } from '~/server/singleton/service'
import { Constant } from '~/server/common/constants'
import { Logger } from '$base/logger'

const logger = Logger.child({ label: 'session', backend: 'transport', transport: 'trpc' })

export const router = _router({
  login: publicProcedure
    .input(
      object({
        handle: zodHandle,
        md5HashedPassword: string(),
        persist: boolean(),
      }),
    )
    .query(async ({ input: { handle, md5HashedPassword, persist }, ctx }) => {
      try {
        const session = await ctx.session.getBinding()
        if (!session) {
          throwGucchoError(GucchoError.UnableToRetrieveSession)
        }
        const [ok, user] = await users.testPassword({ handle }, md5HashedPassword)
        if (!ok) {
          throwGucchoError(GucchoError.PasswordMismatch)
        }

        const opt = {
          httpOnly: true,
          maxAge: persist ? Constant.PersistDuration as number : undefined,
        }
        const partialSession = { userId: UserProvider.idToString(user.id) }
        const newSessionId = ctx.session.id
          ? await sessions.update(ctx.session.id, partialSession)
          : await sessions.create(Object.assign(partialSession, detectDevice(ctx.h3Event)))

        if (newSessionId && (newSessionId !== ctx.session.id || persist)) {
          setCookie(ctx.h3Event, Constant.SessionLabel, newSessionId, opt)
        }
        if (persist) {
          setCookie(ctx.h3Event, Constant.Persist, 'yes', opt)
        }
        return {
          user: mapId(user, UserProvider.idToString),
        }
      }
      catch (err) {
        if (err instanceof TRPCError) {
          throw err
        }

        // unknown error
        logger.error(err)
        throwGucchoError(GucchoError.UnknownError)
      }
    }),
  retrieve: publicProcedure
    .query(async ({ ctx }) => {
      if (!ctx.session.id) {
        throwGucchoError(GucchoError.SessionNotFound)
      }
      const session = await sessions.get(ctx.session.id)

      if (!session) {
        throwGucchoError(GucchoError.SessionNotFound)
      }
      if (session.userId) {
        try {
          const user = await users.getCompactById({
            id: UserProvider.stringToId(session.userId),
          })
          return {
            user: mapId(user, UserProvider.idToString),
          }
        }
        catch (_) {
          return {
            user: null,
          }
        }
      }
      return {
        user: null,
      }
    }),
  destroy: pSession.mutation(({ ctx }) => {
    deleteCookie(ctx.h3Event, Constant.SessionLabel)
    deleteCookie(ctx.h3Event, Constant.Persist)
    return sessions.destroy(ctx.session.id)
  }),
})
