import type {
  AvailableRuleset,
  LeaderboardRankingSystem,
  RankingSystem,
  Ruleset,
} from '~/types/common'
import type {
  AssertHasOverallRankingSystem,
  AssertHasRankingSystem,
  AssertHasRuleset,
  ServerOverallRankingSystemDef,
  ServerRankingSystemDef,
} from '~/types/server'

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

export const assertHasRuleset: AssertHasRuleset = (
  mode,
  ruleset,
): ruleset is Ruleset & AvailableRuleset<typeof mode> => {
  const mDef = havingRankingSystem[mode]
  return ruleset in mDef
}

export const assertHasRankingSystem: AssertHasRankingSystem = (
  mode,
  ruleset,
  rankingSystem,
): rankingSystem is RankingSystem =>
  havingRankingSystem[mode][ruleset].includes(rankingSystem as RankingSystem)

export const assertHasOverallRankingSystem: AssertHasOverallRankingSystem = (
  mode,
  ruleset,
  rankingSystem,
): rankingSystem is LeaderboardRankingSystem =>
  havingLeaderboardRankingSystem[mode][ruleset].includes(
    rankingSystem as LeaderboardRankingSystem,
  )
