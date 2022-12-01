import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { zodHandle, zodMode, zodPPRankingSystem, zodRelationType, zodRuleset } from '../shapes'
import { router as _router, publicProcedure as p } from '../trpc'
import { userNotFound } from '../messages'
import type { RankingSystem as ServerRankingSystem } from '../config'
import { serverRankingSystemConfig } from '../config'
import type { Range } from '~/types/common'
import { followUserPreferences } from '~/server/transforms'
import { countRelationship, getBaseUser, getBests, getFullUser } from '$/client'

export const router = _router({
  userpage: p.input(z.object({
    handle: zodHandle,
  })).query(async ({ input: { handle } }) => {
    const user = await getFullUser({ handle, excludes: { relationships: true, secrets: true } })
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
    const user = await getFullUser({ handle, excludes: { email: true } })
    if (user == null) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: userNotFound,
      })
    }
    return followUserPreferences({ user, scope: 'public' })
  }),
  best: p.input(z.object({
    handle: zodHandle,
    mode: zodMode,
    ruleset: zodRuleset,
    rankingSystem: zodPPRankingSystem,
    page: z.number().gte(0).lt(10),
  })).query(async ({ input }) => {
    const user = await getBaseUser({ handle: input.handle })
    if (!user)
      throw new TRPCError({ code: 'NOT_FOUND', message: userNotFound })

    if (!(input.rankingSystem in serverRankingSystemConfig))
      throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'ranking system not supported' })

    const returnValue = await getBests({
      id: user.id,
      mode: input.mode,
      ruleset: input.ruleset,
      rankingSystem: input.rankingSystem as ServerRankingSystem,
      page: input.page as Range<0, 10>,
      perPage: 10,
    })
    if (!returnValue)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
    return returnValue
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
