import type {
  AvailableRuleset,
  LeaderboardRankingSystem,
  PPRankingSystem,
  RankingSystem,
  Ruleset,
} from '~/types/common'
import type {
  AssertHasLeaderboardRankingSystem,
  AssertHasRankingSystem,
  AssertHasRuleset,
  ServerRankingSystemDef,
} from '~/types/server'

const ppRankingSystems = ['ppv2', 'score'] as const
const leaderboardRankingSystems = ['ppv2', 'rankedScore', 'totalScore'] as const

const defaultConf = {
  leaderboardRankingSystem: leaderboardRankingSystems,
  rankingSystem: ppRankingSystems,
}

const havingRankingSystem: ServerRankingSystemDef = {
  osu: {
    standard: defaultConf,
    relax: defaultConf,
    autopilot: defaultConf,
  },
  taiko: {
    standard: defaultConf,
    relax: defaultConf,
  },
  fruits: {
    standard: defaultConf,
    relax: defaultConf,
  },
  mania: {
    standard: defaultConf,
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
  havingRankingSystem[mode][ruleset].rankingSystem.includes(rankingSystem as PPRankingSystem)

export const assertHasLeaderboardRankingSystem: AssertHasLeaderboardRankingSystem = (
  mode,
  ruleset,
  rankingSystem,
): rankingSystem is LeaderboardRankingSystem =>
  havingRankingSystem[mode][ruleset].leaderboardRankingSystem.includes(rankingSystem as LeaderboardRankingSystem)
