import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { hasLeaderboardRankingSystem, hasRuleset } from '../config'
import { userNotFound } from '../messages'
import {
  zodHandle,
  zodLeaderboardRankingSystem,
  zodMode,
  zodRankingStatus,
  zodRelationType,
  zodRuleset,
} from '../shapes'
import { router as _router, publicProcedure as p } from '../trpc'
import { followUserSettings } from '~/server/transforms'
import {
  UserProvider,
  UserRelationProvider,
} from '~/adapters/ppy.sb@bancho.py/server'
import { idToString } from '$active'

import type { NumberRange } from '~/types/common'
const userProvider = new UserProvider()
const userRelationshipProvider = new UserRelationProvider()

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
        includes: z.array(zodRankingStatus).default(['ranked', 'loved', 'approved']),
      }),
    )
    .query(async ({ input }) => {
      const user = await userProvider.getEssential({ handle: input.handle })
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: userNotFound })
      }

      const { mode, ruleset, rankingSystem } = input
      if (
        !hasRuleset(mode, ruleset)
        || !hasLeaderboardRankingSystem(mode, ruleset, rankingSystem)
      ) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'ranking system not supported',
        })
      }

      const returnValue = await userProvider.getBests({
        id: user.id,
        mode,
        ruleset,
        rankingSystem,
        page: input.page as NumberRange<0, 10>,
        perPage: 10,
        rankingStatus: input.includes,
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
        includes: z.array(zodRankingStatus).default(['ranked', 'loved', 'approved']),
      }),
    )
    .query(async ({ input }) => {
      const user = await userProvider.getEssential({ handle: input.handle })
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: userNotFound })
      }

      const { mode, ruleset, rankingSystem } = input
      if (
        !hasRuleset(mode, ruleset)
        || !hasLeaderboardRankingSystem(mode, ruleset, rankingSystem)
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
        rankingStatus: input.includes,
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
