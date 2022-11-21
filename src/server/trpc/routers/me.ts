// !eslint-disable-next-line import/default, @typescript-eslint/no-unused-vars
// import bcrypt from 'bcryptjs'
import { TRPCError } from '@trpc/server'
import z from 'zod'
import { router as _router } from '../trpc'
import { zodHandle, zodRelationType } from '../shapes'
import { procedureWithUserLoggedIn as pUser } from './../middleware/user'
import {
  getFullUser,
  getBaseUser,
  getOneRelationShip,
  getRelationships,
  updateUser,
  removeRelationship
} from '$/client'
import { calculateMutualRelationships } from '~/server/transforms'

export const router = _router({
  fullSecret: pUser.query(async ({ ctx }) => {
    return await getFullUser(ctx.user.id, { email: true, secrets: true })
  }),
  updatePreferences: pUser.input(z.object({
    email: z.string().email().optional(),
    name: z.string().optional()
  })).mutation(async ({ ctx, input }) => {
    // TODO: check input ok
    const result = await updateUser(ctx.user, input)
    if (!result) { throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' }) }
    ctx.user = result
    return ctx.user
  }),
  relation: pUser
    .input(
      z.object({
        target: zodHandle
      })
    )
    .query(async ({ input: { target }, ctx }) => {
      const [fromUser, targetUser] = await Promise.all([
        ctx.user,
        getBaseUser(target)
      ])
      if (!fromUser || !targetUser) {
        return
      }
      const [fromRelationship, targetRelationship] = await Promise.all([
        getOneRelationShip(fromUser, targetUser),
        getOneRelationShip(targetUser, fromUser)
      ])
      return {
        from: [fromRelationship],
        target: [targetRelationship],
        mutual:
          fromRelationship &&
          targetRelationship &&
          calculateMutualRelationships(
            [fromRelationship],
            [targetRelationship]
          )
      }
    }),
  relations: pUser.query(async ({ ctx }) => {
    return await getRelationships(ctx.user)
  }),
  removeOneRelation: pUser
    .input(
      z.object({
        target: zodHandle,
        type: zodRelationType
      })
    )
    .query(async ({ input, ctx }) => {
      const [fromUser, targetUser] = await Promise.all([
        ctx.user,
        getBaseUser(input.target)
      ])
      if (!fromUser || !targetUser) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'at least one of the supplied user is not exist'
        })
      }
      try {
        await removeRelationship(fromUser, targetUser, input.type)
        return true
      } catch (err: any) {
        if (err.message === 'not-found') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'specified relation type in user not found'
          })
        }
        throw err
      }
    })
})
