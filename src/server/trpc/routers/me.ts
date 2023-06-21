import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import bcrypt from 'bcryptjs'

import {
  atLeastOneUserNotExists,
  oldPasswordMismatch,
  relationTypeNotFound,
  userExists,
} from '../messages'
import { zodHandle, zodRelationType, zodTipTapJSONContent } from '../shapes'
import { router as _router } from '../trpc'
import { userProcedure as pUser } from '~/server/trpc/middleware/user'
import { UserProvider, UserRelationProvider } from '$active/server'

const { compare } = bcrypt

const users = new UserProvider()
const relations = new UserRelationProvider()

// const verifiedEmail = new Map<string, Set<string>>()

export const router = _router({
  settings: pUser.query(async ({ ctx }) => {
    return await users.getFull({
      handle: UserProvider.idToString(ctx.user.id),
      includeHidden: true,
      excludes: { statistics: true, relationships: true, secrets: false },
    })
  }),

  changeUserpage: pUser
    .input(
      z.object({
        profile: zodTipTapJSONContent,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await users.changeUserpage?.(ctx.user, {
        profile: input.profile,
      })
      return result
    }),

  changeSettings: pUser
    .input(
      z.object({
        email: z.string().email().optional(),
        name: z.string().trim().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const update: Partial<typeof input & { userpageContent: string }> = {}
      // TODO: check email(should verified by frontend with another request (not impl'd yet ))
      if (input.name) {
        const existedUser = await users.getEssential({
          handle: input.name,
          keys: ['id', 'name', 'safeName'],
        }).catch(noop<undefined>)
        if (existedUser?.name === input.name) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: userExists,
          })
        }

        update.name = input.name
      }

      const result = await users.changeSettings(ctx.user, update)
      if (!result) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }
      ctx.user = result
      return ctx.user
    }),

  changeAvatar: pUser
    .input(z.object({
      avatar: z.instanceof(Uint8Array),
    })).mutation(async ({ ctx, input }) => {
      return await users.changeAvatar(ctx.user, input.avatar)
    }),

  updatePassword: pUser
    .input(
      z.object({
        oldPassword: z.string(),
        newPassword: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userWithPassword = await users.getEssentialById({
        id: ctx.user.id,
        includes: { secrets: true },
      })
      if (
        !(await compare(
          input.oldPassword,
          userWithPassword.secrets.password
        ))
      ) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: oldPasswordMismatch,
        })
      }

      return await users.changePassword(
        userWithPassword,
        input.newPassword
      )
    }),

  relation: pUser
    .input(
      z.object({
        target: zodHandle,
      })
    )
    .query(async ({ input: { target }, ctx }) => {
      const [fromUser, targetUser] = await Promise.all([
        ctx.user,
        users.getEssential({ handle: target }),
      ])
      if (!fromUser || targetUser == null) {
        return
      }

      const [fromRelationship, targetRelationship] = await Promise.all([
        relations.getOne(fromUser, targetUser),
        relations.getOne(targetUser, fromUser),
      ])
      return {
        self: [fromRelationship],
        counterpart: [targetRelationship],
        mutual:
          (fromRelationship !== undefined && targetRelationship !== undefined)
            ? calculateMutualRelationships(
              [fromRelationship],
              [targetRelationship]
            )
            : undefined,
      }
    }),

  relations: pUser.query(async ({ ctx }) => {
    return await (await relations.get({ user: ctx.user })).map(f => mapId(f, UserRelationProvider.idToString))
  }),

  removeOneRelation: pUser
    .input(
      z.object({
        target: zodHandle,
        type: zodRelationType,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [fromUser, targetUser] = await Promise.all([
        ctx.user,
        users.getEssential({ handle: input.target }),
      ])
      if (!fromUser || targetUser == null) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: atLeastOneUserNotExists,
        })
      }
      try {
        await relations.removeOne({
          fromUser,
          targetUser,
          type: input.type,
        })
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
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [fromUser, targetUser] = await Promise.all([
        ctx.user,
        users.getEssential({ handle: input.target }),
      ])
      if (!fromUser || targetUser == null) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: atLeastOneUserNotExists,
        })
      }
      try {
        await relations.createOneRelationship({
          fromUser,
          targetUser,
          type: input.type,
        })
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
