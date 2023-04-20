import type {
  AvailableRuleset,
  LeaderboardRankingSystem,
  Mode,
  PPRankingSystem,
  RankingSystem,
  Ruleset,
} from '~/types/common'
import type {
  HasLeaderboardRankingSystem,
  HasRankingSystem,
  HasRuleset,
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

export const hasRuleset: HasRuleset = <M extends Mode>(
  mode: M,
  ruleset: Ruleset
): ruleset is Ruleset & AvailableRuleset<M> => {
  const mDef = havingRankingSystem[mode]
  return ruleset in mDef
}

export const hasRankingSystem: HasRankingSystem = (
  mode,
  ruleset,
  rankingSystem
): rankingSystem is RankingSystem =>
  havingRankingSystem[mode][ruleset].rankingSystem.includes(rankingSystem as PPRankingSystem)

export const hasLeaderboardRankingSystem: HasLeaderboardRankingSystem = (
  mode,
  ruleset,
  rankingSystem
): rankingSystem is LeaderboardRankingSystem =>
  havingRankingSystem[mode][ruleset].leaderboardRankingSystem.includes(rankingSystem as LeaderboardRankingSystem)
