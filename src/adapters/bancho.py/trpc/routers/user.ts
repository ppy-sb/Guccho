import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { zodHandle, zodRelationType } from '../shapes'
import { publicProcedure as p, router as _router } from './../trpc'
import { getBaseUser, getFullUser, prismaClient as db } from '$/bancho.py/backend-clients'
import { followUserPreferences } from '$/bancho.py/backend-clients/transforms'

export const router = _router({
  userpage: p.input(z.object({
    handle: zodHandle
  })).query(async ({ input: { handle } }) => {
    const user = await getFullUser(handle, { relationships: false })
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'not found'
      })
    }
    return followUserPreferences(user, 'public')
  }),
  full: p.input(z.object({
    handle: zodHandle
  })).query(async ({ input: { handle } }) => {
    const user = await getFullUser(handle, { email: true })
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'not found'
      })
    }
    return followUserPreferences(user, 'public')
  }),
  base: p.input(z.object({
    handle: zodHandle
  })).query(async ({ input }) => {
    const user = await getBaseUser(input.handle)
    return user
  }),
  countRelations: p.input(z.object({
    handle: zodHandle,
    type: zodRelationType
  })).query(async ({ input: { handle, type } }) => {
    const user = await getBaseUser(handle)
    if (!user) { return }
    const count = await db.relationship.count({
      where: {
        toUserId: user.id,
        type
      }
    })
    return count
  })
})
