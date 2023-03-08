import { idToString } from '$active'
import { TRPCError } from '@trpc/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { UserProvider } from '~/adapters/ppy.sb@bancho.py/server'
import { getSession } from '~/server/session'

import {
  passwordMismatch,
  sessionNotFound,
  unableToRetrieveSession,
  unknownError,
  userNotFound,
} from '../messages'
import { sessionProcedure as pSession } from '../middleware/session'
import { zodHandle } from '../shapes'
import { router as _router } from '../trpc'

const { compare } = bcrypt
const userProvider = new UserProvider()
export const router = _router({
  login: pSession
    .input(
      z.object({
        handle: zodHandle,
        md5HashedPassword: z.string(),
      }),
    )
    .query(async ({ input: { handle, md5HashedPassword }, ctx }) => {
      try {
        const user = await userProvider.getEssential({
          handle,
          includes: { secrets: true },
        })
        if (user == null) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: userNotFound,
          })
        }
        const result = await compare(md5HashedPassword, user.secrets.password)
        if (!result) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: passwordMismatch,
          })
        }
        const session = await ctx.session.getBinding()
        if (!session) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: unableToRetrieveSession,
          })
        }
        session.userId = user.id
        return {
          user: Object.assign(user, { id: idToString(user.id) }),
        }
      }
      catch (err) {
        if (err instanceof TRPCError) {
          throw err
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: unknownError,
        })
      }
    }),
  retrieve: pSession
    .input(
      z
        .object({
          sessionId: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      let session
      if (input?.sessionId) {
        session = await getSession(input.sessionId)
      }
      else {
        session = await ctx.session.getBinding()
      }

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: sessionNotFound,
        })
      }
      if (session.userId) {
        const user = await userProvider.getEssentialById({
          id: session.userId,
        })
        if (!user) {
          return {
            user: null,
          }
        }
        return {
          user: Object.assign(user, { id: idToString(user.id) }),
        }
      }
      return {
        user: null,
      }
    }),
})
