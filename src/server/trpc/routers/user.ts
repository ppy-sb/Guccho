import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import {
  zodHandle,
  zodLeaderboardRankingSystem,
  zodMode,
  zodRelationType,
  zodRuleset,
} from '../shapes'
import { router as _router, publicProcedure as p } from '../trpc'
import { userNotFound } from '../messages'
import { assertHasLeaderboardRankingSystem } from '../config'
import type { NumberRange } from '~/types/common'
import { followUserSettings } from '~/server/transforms'
import { UserDataProvider, UserRelationshipDataProvider } from '$active/client'
import { idToString } from '$active/exports'
import { assertHasRuleset } from '~/adapters/bancho.py/checks'

const userProvider = new UserDataProvider()
const userRelationshipProvider = new UserRelationshipDataProvider()

export const router = _router({
  userpage: p
    .input(
      z.object({
        handle: zodHandle,
      }),
    )
    .query(async ({ input: { handle } }) => {
      const user = await userProvider.getFull({
        handle,
        excludes: { relationships: true, secrets: true },
      })
      if (user == null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: userNotFound,
        })
      }
      return Object.assign(followUserSettings({ user, scope: 'public' }), {
        id: idToString(user.id),
      })
    }),
  full: p
    .input(
      z.object({
        handle: zodHandle,
      }),
    )
    .query(async ({ input: { handle } }) => {
      const user = await userProvider.getFull({
        handle,
        excludes: { email: true },
      })
      if (user == null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: userNotFound,
        })
      }
      return Object.assign(followUserSettings({ user, scope: 'public' }), {
        id: idToString(user.id),
      })
    }),
  best: p
    .input(
      z.object({
        handle: zodHandle,
        mode: zodMode,
        ruleset: zodRuleset,
        rankingSystem: zodLeaderboardRankingSystem,
        page: z.number().gte(0).lt(10),
      }),
    )
    .query(async ({ input }) => {
      const user = await userProvider.getEssential({ handle: input.handle })
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: userNotFound })
      }

      const { mode, ruleset, rankingSystem } = input
      if (
        !assertHasRuleset(mode, ruleset)
        || !assertHasLeaderboardRankingSystem(mode, ruleset, rankingSystem)
      ) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'ranking system not supported',
        })
      }

      const returnValue = await userProvider.getBests({
        id: user.id,
        mode: input.mode,
        ruleset: input.ruleset,
        rankingSystem: input.rankingSystem,
        page: input.page as NumberRange<0, 10>,
        perPage: 10,
      })
      if (!returnValue) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }
      return returnValue
    }),
  tops: p
    .input(
      z.object({
        handle: zodHandle,
        mode: zodMode,
        ruleset: zodRuleset,
        rankingSystem: zodLeaderboardRankingSystem,
        page: z.number().gte(0).lt(10),
      }),
    )
    .query(async ({ input }) => {
      const user = await userProvider.getEssential({ handle: input.handle })
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: userNotFound })
      }

      const { mode, ruleset, rankingSystem } = input
      if (
        !assertHasRuleset(mode, ruleset)
        || !assertHasLeaderboardRankingSystem(mode, ruleset, rankingSystem)
      ) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'ranking system not supported',
        })
      }

      const returnValue = await userProvider.getTops({
        id: user.id,
        mode: input.mode,
        ruleset: input.ruleset,
        rankingSystem: input.rankingSystem,
        page: input.page as NumberRange<0, 10>,
        perPage: 10,
      })
      if (!returnValue) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }
      return returnValue
    }),
  essential: p
    .input(
      z.object({
        handle: zodHandle,
      }),
    )
    .query(async ({ input }) => {
      const user = await userProvider.getEssential({ handle: input.handle })
      if (!user) {
        return null
      }
      return Object.assign(user, { id: idToString(user.id) })
    }),
  countRelations: p
    .input(
      z.object({
        handle: zodHandle,
        type: zodRelationType,
      }),
    )
    .query(async ({ input: { handle, type } }) => {
      const user = await userProvider.getEssential({ handle })
      if (user == null) {
        return
      }
      const count = await userRelationshipProvider.count({ user, type })
      return count
    }),
})
