/* eslint-disable import/no-named-as-default-member */
// eslint-disable-next-line import/default
import bcrypt from 'bcryptjs'
import { TRPCError } from '@trpc/server'
import z from 'zod'
import { router as _router } from '../trpc'
import { zodHandle, zodRelationType } from '../shapes'
import { oldPasswordMismatch, userNotFound, userExists, atLeastOneUserNotExists, relationTypeNotFound } from '../messages'
import { procedureWithUserLoggedIn as pUser } from '~/server/trpc/middleware/user'
import {
  getFullUser,
  getBaseUser,
  getOneRelationShip,
  getRelationships,
  updateUser,
  removeRelationship,
  updateUserPassword
} from '$/client'
import { calculateMutualRelationships } from '~/server/transforms'

export const router = _router({
  fullSecret: pUser.query(async ({ ctx }) => {
    return await getFullUser(ctx.user.id, { email: true, secrets: true })
  }),
  updatePreferences: pUser
    .input(z.object({
      email: z.string().email().optional(),
      name: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
      // TODO: check email(should verified by frontend with another request (not impl'd yet ))
      // if (input.email) {
      //   const user = await getBaseUser({ handle: input.email, includes: { email: true } })
      // }
      if (input.name) {
        const existingUser = await getBaseUser({
          handle: input.name,
          keys: ['id', 'name', 'safeName']
        })
        if (existingUser) { throw new TRPCError({ code: 'PRECONDITION_FAILED', message: userExists }) }
      }
      const result = await updateUser(ctx.user, input)
      if (!result) { throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' }) }
      ctx.user = result
      return ctx.user
    }),
  updatePassword: pUser.input(z.object({
    oldPassword: z.string(),
    newPassword: z.string()
  })).mutation(async ({ ctx, input }) => {
    const userWithPassword = await getBaseUser({ handle: ctx.user.id, includes: { secrets: true } })
    if (!userWithPassword) { throw new TRPCError({ code: 'NOT_FOUND', message: userNotFound }) }
    if (!await bcrypt.compare(input.oldPassword, userWithPassword.secrets.password)) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: oldPasswordMismatch })
    }
    return await updateUserPassword(userWithPassword, input.newPassword)
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
        getBaseUser({ handle: target })
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
        getBaseUser({ handle: input.target })
      ])
      if (!fromUser || !targetUser) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: atLeastOneUserNotExists
        })
      }
      try {
        await removeRelationship(fromUser, targetUser, input.type)
        return true
      } catch (err: any) {
        if (err.message === 'not-found') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: relationTypeNotFound
          })
        }
        throw err
      }
    })
})
