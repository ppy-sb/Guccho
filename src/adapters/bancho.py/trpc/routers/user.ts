import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { getBaseUser, getFullUser, getBaseUsers } from '../../backend-clients'
import { followUserPreferences } from '../../backend-clients/transforms'
import { createRouter } from '../context'

export const router = createRouter()

  .query('userpage', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input: { handle } }) {
      const user = await getFullUser(handle, { relationships: false })
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'not found'
        })
      }
      return followUserPreferences(user, 'public')
    }
  })

  .query('full', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input: { handle } }) {
      const user = await getFullUser(handle, { email: true })
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'not found'
        })
      }
      return followUserPreferences(user, 'public')
    }
  })

  .query('base', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input }) {
      const user = await getBaseUser(input.handle)
      return user
    }
  })

  .query('.base', {
    input: z.object({
      handle: z.union([z.string(), z.number()])
    }),
    async resolve ({ input }) {
      return await getBaseUsers(input.handle)
    }
  })
