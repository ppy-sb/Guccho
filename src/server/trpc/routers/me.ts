import bcrypt from 'bcryptjs'
import { TRPCError } from '@trpc/server'
import z from 'zod'

import { router as _router } from '../trpc'
import { zodHandle, zodRelationType, zodTipTapJSONContent } from '../shapes'
import { atLeastOneUserNotExists, oldPasswordMismatch, relationTypeNotFound, userExists, userNotFound } from '../messages'
import { userProcedure as pUser } from '~/server/trpc/middleware/user'
import { UserDataProvider, UserRelationshipDataProvider } from '$active/client'
import { calculateMutualRelationships } from '~/server/transforms'
import { idToString } from '$active/config'

const userProvider = new UserDataProvider()
const relationProvider = new UserRelationshipDataProvider()
export const router = _router({
  fullSecret: pUser.query(async ({ ctx }) => {
    return await userProvider.getFull({ handle: idToString(ctx.user.id), excludes: { secrets: false } })
  }),
  changeUserpage: pUser.input(z.object({
    profile: zodTipTapJSONContent,
  })).mutation(async ({ ctx, input }) => {
    const result = await userProvider.changeUserpage?.(ctx.user, { profile: input.profile })
    return result
  }),
  changeSettings: pUser
    .input(z.object({
      email: z.string().email().optional(),
      name: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const update: Partial<typeof input & { userpageContent: string }> = {}
      // TODO: check email(should verified by frontend with another request (not impl'd yet ))
      // if (input.email) {
      //   const user = await provider.essential({ handle: input.email, includes: { email: true } })
      // }
      if (input.name) {
        const existedUser = await userProvider.getEssential({
          handle: input.name,
          keys: ['id', 'name', 'safeName'],
        })
        if (existedUser?.name === input.name)
          throw new TRPCError({ code: 'PRECONDITION_FAILED', message: userExists })

        update.name = input.name
      }

      const result = await userProvider.changeSettings(ctx.user, update)
      if (!result)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      ctx.user = result
      return ctx.user
    }),
  updatePassword: pUser.input(z.object({
    oldPassword: z.string(),
    newPassword: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const userWithPassword = await userProvider.getEssentialById({ id: ctx.user.id, includes: { secrets: true } })
    if (userWithPassword == null)
      throw new TRPCError({ code: 'NOT_FOUND', message: userNotFound })
    if (!await bcrypt.compare(input.oldPassword, userWithPassword.secrets.password))
      throw new TRPCError({ code: 'UNAUTHORIZED', message: oldPasswordMismatch })

    return await userProvider.changePassword(userWithPassword, input.newPassword)
  }),
  relation: pUser
    .input(
      z.object({
        target: zodHandle,
      }),
    )
    .query(async ({ input: { target }, ctx }) => {
      const [fromUser, targetUser] = await Promise.all([
        ctx.user,
        userProvider.getEssential({ handle: target }),
      ])
      if (!fromUser || (targetUser == null))
        return

      const [fromRelationship, targetRelationship] = await Promise.all([
        relationProvider.getOne(fromUser, targetUser),
        relationProvider.getOne(targetUser, fromUser),
      ])
      return {
        from: [fromRelationship],
        target: [targetRelationship],
        mutual:
          fromRelationship
          && targetRelationship
          && calculateMutualRelationships(
            [fromRelationship],
            [targetRelationship],
          ),
      }
    }),
  relations: pUser.query(async ({ ctx }) => {
    return await relationProvider.get({ user: ctx.user })
  }),
  removeOneRelation: pUser
    .input(
      z.object({
        target: zodHandle,
        type: zodRelationType,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [fromUser, targetUser] = await Promise.all([
        ctx.user,
        userProvider.getEssential({ handle: input.target }),
      ])
      if (!fromUser || (targetUser == null)) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: atLeastOneUserNotExists,
        })
      }
      try {
        await relationProvider.removeOne({ fromUser, targetUser, type: input.type })
        return true
      }
      catch (err: any) {
        if (err.message === 'not-found') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: relationTypeNotFound,
          })
        }
        throw err
      }
    }),
  addOneRelation: pUser
    .input(
      z.object({
        target: zodHandle,
        type: zodRelationType,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const [fromUser, targetUser] = await Promise.all([
        ctx.user,
        userProvider.getEssential({ handle: input.target }),
      ])
      if (!fromUser || (targetUser == null)) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: atLeastOneUserNotExists,
        })
      }
      try {
        await relationProvider.createOneRelationship({ fromUser, targetUser, type: input.type })
        return true
      }
      catch (err: any) {
        if (err.message === 'has-relationship') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'need to delete old relation before create new',
          })
        }
      }
    }),
})
