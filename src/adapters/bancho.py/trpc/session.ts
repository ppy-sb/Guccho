// import type { inferAsyncReturnType } from '@trpc/server'
import * as trpc from '@trpc/server'
// eslint-disable-next-line import/default
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createSession, getSession, refresh } from '../session'
import { getBaseUser } from '../backend-clients'
// eslint-disable-next-line import/no-named-as-default-member
const { compare } = bcrypt

export const router = trpc.router()

  .query('user.login', {
    input: z.object({
      handle: z.union([z.string(), z.number()]),
      md5HashedPassword: z.string()
    }),
    async resolve ({ input: { handle, md5HashedPassword } }) {
      try {
        const user = await getBaseUser(handle, { secrets: true })
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'user not found'
          })
        }
        const result = await compare(md5HashedPassword, user.secrets.password)
        if (!result) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'password mismatch'
          })
        }
        const sessionId = createSession(user)
        return {
          user,
          sessionId
        }
      } catch (err) {
        if (err instanceof TRPCError) {
          throw err
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR'
        })
      }
    }
  })

  .query('user.retrieve-session', {
    input: z.object({
      sessionId: z.string()
    }),
    async resolve ({ input: { sessionId } }) {
      const session = getSession(sessionId)
      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'session not found.'
        })
      }
      const newSessionId = refresh(sessionId)
      if (!newSessionId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'unable to refresh token, please logout then login.'
        })
      }
      return {
        user: await getBaseUser(session.userId),
        sessionId: newSessionId
      }
    }
  })
