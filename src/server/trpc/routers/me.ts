import bcrypt from 'bcryptjs'
import { TRPCError } from '@trpc/server'
import z from 'zod'
import { generateHTML } from '@tiptap/html'
import { router as _router } from '../trpc'
import { zodHandle, zodRelationType, zodTipTapJSONContent } from '../shapes'
import { atLeastOneUserNotExists, oldPasswordMismatch, relationTypeNotFound, userExists, userNotFound } from '../messages'
import { userProcedure as pUser } from '~/server/trpc/middleware/user'
import UserDataProvider from '$active/client/user'
import UserRelationshipDataProvider from '$active/client/user-relations'
import { calculateMutualRelationships } from '~/server/transforms'

import useEditorExtensions from '~/composables/useEditorExtensions'

const userProvider = new UserDataProvider()
const relationProvider = new UserRelationshipDataProvider()
export const router = _router({
  fullSecret: pUser.query(async ({ ctx }) => {
    return await userProvider.getFullUser({ handle: ctx.user.id, excludes: { secrets: false } })
  }),
  updatePreferences: pUser
    .input(z.object({
      email: z.string().email().optional(),
      name: z.string().optional(),
      profile: zodTipTapJSONContent.optional(),
    })).mutation(async ({ ctx, input }) => {
      const update: Partial<typeof input & { userpageContent: string }> = {}
      // TODO: check email(should verified by frontend with another request (not impl'd yet ))
      // if (input.email) {
      //   const user = await provider.getBaseUser({ handle: input.email, includes: { email: true } })
      // }
      if (input.name) {
        const existedUser = await userProvider.getBaseUser({
          handle: input.name,
          keys: ['id', 'name', 'safeName'],
        })
        if (existedUser?.name === input.name)
          throw new TRPCError({ code: 'PRECONDITION_FAILED', message: userExists })

        update.name = input.name
      }
      if (input.profile) {
        const renderExtensions = useEditorExtensions()
        try {
          const html = generateHTML(input.profile, renderExtensions)
          update.userpageContent = html
        }
        catch (err) {
          throw new TRPCError({ code: 'PARSE_ERROR', message: 'unable to parse json content' })
        }
      }
      const result = await userProvider.updateUser(ctx.user, update)
      if (!result)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      ctx.user = result
      return ctx.user
    }),
  updatePassword: pUser.input(z.object({
    oldPassword: z.string(),
    newPassword: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const userWithPassword = await userProvider.getBaseUser({ handle: ctx.user.id, includes: { secrets: true } })
    if (userWithPassword == null)
      throw new TRPCError({ code: 'NOT_FOUND', message: userNotFound })
    if (!await bcrypt.compare(input.oldPassword, userWithPassword.secrets.password))
      throw new TRPCError({ code: 'UNAUTHORIZED', message: oldPasswordMismatch })

    return await userProvider.updateUserPassword(userWithPassword, input.newPassword)
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
        userProvider.getBaseUser({ handle: target }),
      ])
      if (!fromUser || (targetUser == null))
        return

      const [fromRelationship, targetRelationship] = await Promise.all([
        relationProvider.getOneRelationship(fromUser, targetUser),
        relationProvider.getOneRelationship(targetUser, fromUser),
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
    return await relationProvider.getRelationships({ user: ctx.user })
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
        userProvider.getBaseUser({ handle: input.target }),
      ])
      if (!fromUser || (targetUser == null)) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: atLeastOneUserNotExists,
        })
      }
      try {
        await relationProvider.removeOneRelationship({ fromUser, targetUser, type: input.type })
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
        userProvider.getBaseUser({ handle: input.target }),
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
