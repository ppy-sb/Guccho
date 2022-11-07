// eslint-disable-next-line import/default
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { getBaseUser } from '../../backend-clients'

import { createRouterWithSession } from '../controllers/session'
import { zodHandle } from '../shapes'
// eslint-disable-next-line import/no-named-as-default-member
const { compare } = bcrypt

export const router = createRouterWithSession()
  .query('login', {
    input: z.object({
      handle: zodHandle,
      md5HashedPassword: z.string()
    }),
    async resolve ({ input: { handle, md5HashedPassword }, ctx }) {
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
        const session = await ctx.session.getBinding()
        if (!session) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'unable to retrieve session'
          })
        }
        session.userId = user.id
        return {
          user
        }
      } catch (err) {
        if (err instanceof TRPCError) {
          throw err
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'unknown error occurred'
        })
      }
    }
  })

  .query('retrieve', {
    async resolve ({ ctx }) {
      console.log('retrieving session', ctx.session.id)
      const session = await ctx.session.getBinding()
      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'session not found.'
        })
      }
      return {
        user: (session.userId && await getBaseUser(session.userId)) ?? undefined
      }
    }
  })
