import type { OverallLeaderboardRankingSystem, RankingSystem } from '~/types/common'
import type { AssertHasOverallRankingSystem, AssertHasRankingSystem, ServerOverallRankingSystemDef, ServerRankingSystemDef } from '~/types/server'

const rankingSystem = ['ppv2', 'score'] as const
const overallLeaderboardRankingSystem = ['ppv2', 'rankedScore', 'totalScore'] as const

const havingRankingSystem: ServerRankingSystemDef = {
  osu: {
    standard: rankingSystem,
    relax: rankingSystem,
    autopilot: rankingSystem,
  },
  taiko: {
    standard: rankingSystem,
    relax: rankingSystem,
  },
  fruits: {
    standard: rankingSystem,
    relax: rankingSystem,
  },
  mania: {
    standard: rankingSystem,
  },
}
const havingOverallLeaderboardRankingSystem: ServerOverallRankingSystemDef = {
  osu: {
    standard: overallLeaderboardRankingSystem,
    relax: overallLeaderboardRankingSystem,
    autopilot: overallLeaderboardRankingSystem,
  },
  taiko: {
    standard: overallLeaderboardRankingSystem,
    relax: overallLeaderboardRankingSystem,
  },
  fruits: {
    standard: overallLeaderboardRankingSystem,
    relax: overallLeaderboardRankingSystem,
  },
  mania: {
    standard: overallLeaderboardRankingSystem,
  },
}

export const assertHasRankingSystem: AssertHasRankingSystem = (rankingSystem, { mode, ruleset }): rankingSystem is RankingSystem => havingRankingSystem[mode][ruleset].includes(rankingSystem as RankingSystem)
export const assertHasOverallRankingSystem: AssertHasOverallRankingSystem = (rankingSystem, { mode, ruleset }): rankingSystem is OverallLeaderboardRankingSystem => havingOverallLeaderboardRankingSystem[mode][ruleset].includes(rankingSystem as OverallLeaderboardRankingSystem)
