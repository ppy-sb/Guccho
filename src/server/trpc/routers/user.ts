import { TRPCError } from '@trpc/server'
import { array, number, object, string } from 'zod'

import { hasLeaderboardRankingSystem, hasRuleset } from '../config'

import {
  zodHandle,
  zodLeaderboardRankingSystem,
  zodMode,
  zodRankingStatus,
  zodRelationType,
  zodRuleset,
} from '../shapes'
import { router as _router, publicProcedure as p } from '../trpc'
import { sessionProcedure } from '../middleware/session'
import { updateSession } from '../../session'
import { mapId } from '../../transforms/mapId'
import { followUserSettings } from '~/server/transforms'
import { UserProvider, UserRelationProvider } from '$active/server'

import type { NumberRange } from '~/types/common'

const userProvider = new UserProvider()
const userRelationshipProvider = new UserRelationProvider()

export const router = _router({
  exists: p
    .input(
      object({
        handle: zodHandle,
      })
    )
    .query(async ({ input: { handle } }) => {
      return userProvider.exists({ handle })
    }),
  userpage: p
    .input(
      object({
        handle: zodHandle,
      })
    )
    .query(async ({ input: { handle } }) => {
      const user = await userProvider.getFull({
        handle,
        excludes: { relationships: true, secrets: true },
      })
      return mapId(followUserSettings({ user, scope: 'public' }), userProvider.idToString)
    }),
  full: p
    .input(
      object({
        handle: zodHandle,
      })
    )
    .query(async ({ input: { handle } }) => {
      const user = await userProvider.getFull({
        handle,
        excludes: { email: true },
      })
      return mapId(followUserSettings({ user, scope: 'public' }), userProvider.idToString)
    }),
  best: p
    .input(
      object({
        handle: zodHandle,
        mode: zodMode,
        ruleset: zodRuleset,
        rankingSystem: zodLeaderboardRankingSystem,
        page: number().gte(0).lt(10),
        includes: array(zodRankingStatus).default(['ranked', 'loved', 'approved']),
      })
    )
    .query(async ({ input }) => {
      const user = await userProvider.getEssential({ handle: input.handle })

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
      object({
        handle: zodHandle,
        mode: zodMode,
        ruleset: zodRuleset,
        rankingSystem: zodLeaderboardRankingSystem,
        page: number().gte(0).lt(10),
        includes: array(zodRankingStatus).default(['ranked', 'loved', 'approved']),
      })
    )
    .query(async ({ input }) => {
      const user = await userProvider.getEssential({ handle: input.handle })

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
      object({
        handle: zodHandle,
      })
    )
    .query(async ({ input }) => {
      const user = await userProvider.getEssential({ handle: input.handle })

      return mapId(user, userProvider.idToString)
    }),
  countRelations: p
    .input(
      object({
        handle: zodHandle,
        type: zodRelationType,
      })
    )
    .query(async ({ input: { handle, type } }) => {
      const user = await userProvider.getEssential({ handle })

      const count = await userRelationshipProvider.count({ user, type })
      return count
    }),
  status: p
    .input(object({
      id: string(),
    })).query(async ({ input: { id } }) => {
      return await userProvider.status({ id: userProvider.stringToId(id) })
    }),
  register: sessionProcedure
    .input(object({
      name: string(),
      safeName: string(),
      email: string().email(),
      passwordMd5: string(),
    })).mutation(async ({ input, ctx }) => {
      const user = await userProvider.register(input)
      const sessionId = ctx.session.id
      updateSession(sessionId, { userId: user.id })
      return user
    }),
})
