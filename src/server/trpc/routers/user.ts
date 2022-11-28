import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { zodHandle, zodRelationType } from '../shapes'
import { router as _router, publicProcedure as p } from '../trpc'
import { userNotFound } from '../messages'
import { followUserPreferences } from '~/server/transforms'
import { countRelationship, getBaseUser, getFullUser } from '$/client'

export const router = _router({
  userpage: p.input(z.object({
    handle: zodHandle,
  })).query(async ({ input: { handle } }) => {
    const user = await getFullUser(handle, { relationships: false })
    if (user == null) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: userNotFound,
      })
    }
    return followUserPreferences({ user, scope: 'public' })
  }),
  full: p.input(z.object({
    handle: zodHandle,
  })).query(async ({ input: { handle } }) => {
    const user = await getFullUser(handle, { email: true })
    if (user == null) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: userNotFound,
      })
    }
    return followUserPreferences({ user, scope: 'public' })
  }),
  base: p.input(z.object({
    handle: zodHandle,
  })).query(async ({ input }) => {
    const user = await getBaseUser({ handle: input.handle })
    return user
  }),
  countRelations: p.input(z.object({
    handle: zodHandle,
    type: zodRelationType,
  })).query(async ({ input: { handle, type } }) => {
    const user = await getBaseUser({ handle })
    if (user == null)
      return
    const count = await countRelationship(user, type)
    return count
  }),
})
