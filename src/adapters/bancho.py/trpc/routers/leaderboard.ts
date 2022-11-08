import z from 'zod'
import { getLeaderboard } from '../../backend-clients/leaderboard'
import { createRouter } from '../context'
import { zodMode, zodRankingSystem, zodRuleset } from './../shapes/index'
import { Range } from '~/types/common'
export const router = createRouter()
  .query('', {
    input: z.object({
      mode: zodMode,
      ruleset: zodRuleset,
      rankingSystem: zodRankingSystem,
      page: z.number().gte(0).lt(10),
      pageSize: z.number().gte(50).lt(100)
    }),
    async resolve ({ input: { mode, ruleset, rankingSystem, page, pageSize } }) {
      if (rankingSystem === 'ppv1') { return [] }
      return await getLeaderboard({ mode, ruleset, rankingSystem, page: page as Range<0, 10>, pageSize: pageSize as Range<50, 100> })
    }
  })
