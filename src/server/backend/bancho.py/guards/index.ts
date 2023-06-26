import type {
  ActiveMode,
  ActiveRuleset,
  AvailableRuleset,
  LeaderboardRankingSystem,
  PPRankingSystem,
  RankingSystem,
} from '~/def/common'
import type {
  HasLeaderboardRankingSystem,
  HasRankingSystem,
  HasRuleset,
  ServerRankingSystemDef,
} from '~/def/server'
import { Mode, Rank, Ruleset } from '~/def'

const ppRankingSystems = [Rank.PPv2, Rank.Score] as const
const leaderboardRankingSystems = [Rank.PPv2, Rank.RankedScore, Rank.TotalScore] as const

const defaultConf = {
  leaderboardRankingSystem: leaderboardRankingSystems,
  rankingSystem: ppRankingSystems,
}

const havingRankingSystem: ServerRankingSystemDef = {
  [Mode.Osu]: {
    [Ruleset.Standard]: defaultConf,
    [Ruleset.Relax]: defaultConf,
    [Ruleset.Autopilot]: defaultConf,
  },
  [Mode.Taiko]: {
    [Ruleset.Standard]: defaultConf,
    [Ruleset.Relax]: defaultConf,
  },
  [Mode.Fruits]: {
    [Ruleset.Standard]: defaultConf,
    [Ruleset.Relax]: defaultConf,
  },
  [Mode.Mania]: {
    [Ruleset.Standard]: defaultConf,
  },
}

export const hasRuleset: HasRuleset = <M extends ActiveMode>(
  mode: M,
  ruleset: ActiveRuleset
): ruleset is ActiveRuleset & AvailableRuleset<M> => {
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
