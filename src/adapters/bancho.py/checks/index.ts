import type { LeaderboardRankingSystem, RankingSystem } from '~/types/common'
import type { AssertHasOverallRankingSystem, AssertHasRankingSystem, ServerOverallRankingSystemDef, ServerRankingSystemDef } from '~/types/server'

const rankingSystem = ['ppv2', 'score'] as const
const leaderboardRankingSystem = ['ppv2', 'rankedScore', 'totalScore'] as const

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
const havingLeaderboardRankingSystem: ServerOverallRankingSystemDef = {
  osu: {
    standard: leaderboardRankingSystem,
    relax: leaderboardRankingSystem,
    autopilot: leaderboardRankingSystem,
  },
  taiko: {
    standard: leaderboardRankingSystem,
    relax: leaderboardRankingSystem,
  },
  fruits: {
    standard: leaderboardRankingSystem,
    relax: leaderboardRankingSystem,
  },
  mania: {
    standard: leaderboardRankingSystem,
  },
}

export const assertHasRankingSystem: AssertHasRankingSystem = (rankingSystem, { mode, ruleset }): rankingSystem is RankingSystem => havingRankingSystem[mode][ruleset].includes(rankingSystem as RankingSystem)
export const assertHasOverallRankingSystem: AssertHasOverallRankingSystem = (rankingSystem, { mode, ruleset }): rankingSystem is LeaderboardRankingSystem => havingLeaderboardRankingSystem[mode][ruleset].includes(rankingSystem as LeaderboardRankingSystem)
