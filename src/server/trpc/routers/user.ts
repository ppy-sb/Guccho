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
import { optionalUserProcedure } from '../middleware/optional-user'
import { userNotFound } from '../messages'
import { Scope, UserPrivilege } from '~/types/user'
import { RankingStatus } from '~/types/beatmap'

import { SessionProvider, UserProvider, UserRelationProvider } from '$active/server'

import type { NumberRange } from '~/types/common'

const userProvider = new UserProvider()
const userRelationshipProvider = new UserRelationProvider()
const session = new SessionProvider()

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
  userpage: optionalUserProcedure
    .input(
      object({
        handle: zodHandle,
      })
    )
    .query(async ({ input: { handle }, ctx }) => {
      const user = await userProvider.getFull({
        handle,
        excludes: { relationships: true, secrets: true },
        includeHidden: true,
      })
      const isSelf = user.id === ctx.user?.id
      if (!user.roles.includes(UserPrivilege.Normal) && !isSelf) {
        throw new TRPCError({ code: 'NOT_FOUND', message: userNotFound })
      }
      return mapId(followUserSettings({ user, scope: Scope.Public }), UserProvider.idToString)
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
      return mapId(followUserSettings({ user, scope: Scope.Public }), UserProvider.idToString)
    }),
  best: p
    .input(
      object({
        handle: zodHandle,
        mode: zodMode,
        ruleset: zodRuleset,
        rankingSystem: zodLeaderboardRankingSystem,
        page: number().gte(0).lt(10),
        includes: array(zodRankingStatus).default([RankingStatus.Ranked, RankingStatus.Loved, RankingStatus.Approved]),
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
        includes: array(zodRankingStatus).default([RankingStatus.Ranked, RankingStatus.Loved, RankingStatus.Approved]),
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

      return mapId(user, UserProvider.idToString)
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
      id: string().trim(),
    })).query(async ({ input: { id } }) => {
      return await userProvider.status({ id: UserProvider.stringToId(id) })
    }),
  register: sessionProcedure
    .input(object({
      name: string().trim(),
      safeName: string().trim(),
      email: string().trim().email(),
      passwordMd5: string().trim(),
    })).mutation(async ({ input, ctx }) => {
      const user = await userProvider.register(input)
      const sessionId = ctx.session.id
      await session.update(sessionId, { userId: UserProvider.idToString(user.id) })
      return user
    }),
})
