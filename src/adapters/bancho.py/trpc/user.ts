// import type { inferAsyncReturnType } from '@trpc/server'
import * as trpc from '@trpc/server'
// eslint-disable-next-line import/default
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { getSession } from '../session'
import { getBaseUser, getFullUser, getBaseUsers } from '../backend-clients'
import { followUserPreferences } from '../backend-clients/transforms'
// eslint-disable-next-line import/no-named-as-default-member

export const router = trpc.router()

  .query('user.userpage', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input: { handle } }) {
      const user = await getFullUser(handle, { relationships: false })
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'user not found'
        })
      }
      return followUserPreferences(user, 'public')
    }
  })

  .query('user.full', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input: { handle } }) {
      const user = await getFullUser(handle, { email: true })
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'user not found'
        })
      }
      return followUserPreferences(user, 'public')
    }
  })

  .query('user.full-secret', {
    input: z.object({
      handle: z.union([z.string(), z.number()]),
      sessionId: z.string().optional()
    }),
    async resolve ({ input }) {
      if (input.sessionId) {
        const session = getSession(input.sessionId)
        if (!session) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'session not found.'
          })
        }
        return await getFullUser(input.handle, { email: true, secrets: true })
      } else {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'you need password or seessionId'
        })
      }
    }
  })

  .query('user.base', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input }) {
      const user = await getBaseUser(input.handle)
      return user
    }
  })

  .query('users.base', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input }) {
      return await getBaseUsers(input.handle)
    }
  })
