import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { getBaseUser, getFullUser, prismaClient as db } from '../../backend-clients'
import { followUserPreferences } from '../../backend-clients/transforms'
import { createRouter } from '../context'
import { zodHandle, zodRelationType } from '../shapes'
export const router = createRouter()
  .query('userpage', {
    input: z.object({
      handle: zodHandle
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
      handle: zodHandle
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
      handle: zodHandle
    }),
    async resolve ({ input }) {
      const user = await getBaseUser(input.handle)
      return user
    }
  })

  .query('count-relations', {
    input: z.object({
      handle: zodHandle,
      type: zodRelationType
    }),
    async resolve ({ input: { handle, type } }) {
      const user = await getBaseUser(handle)
      if (!user) { return }
      const count = await db.relationship.count({
        where: {
          toUserId: user.id,
          type
        }
      })
      return count
    }
  })
