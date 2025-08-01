import type {
  ActiveMode,
  ActiveRuleset,
  AvailableRuleset,
  LeaderboardRankingSystem,
  RankingSystem,
} from '../'
import { Mode, Rank, Ruleset } from '~/def'

import { type Brand } from '~/def/internal-utils'

const ppRankingSystems = [Rank.PPv2, Rank.Score] as const
const leaderboardRankingSystems = [Rank.PPv2, Rank.RankedScore, Rank.TotalScore] as const

const defaultConf = {
  leaderboardRankingSystem: leaderboardRankingSystems,
  rankingSystem: ppRankingSystems,
}

const havingRankingSystem = {
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
} as const

export function hasRuleset<M extends ActiveMode>(mode: M, ruleset: ActiveRuleset): ruleset is ActiveRuleset & AvailableRuleset<M> {
  return ruleset in havingRankingSystem[mode]
}

export function hasRankingSystem<
  M extends ActiveMode,
  R extends AvailableRuleset<M>,
>(
  mode: M,
  ruleset: R,
  rankingSystem: Brand<string> | RankingSystem
): rankingSystem is RankingSystem {
  const modeConfig = havingRankingSystem[mode] as typeof havingRankingSystem[Mode.Osu] // TS type narrowed too much
  return modeConfig[ruleset].rankingSystem.includes(rankingSystem as any)
}

export function hasLeaderboardRankingSystem<
  M extends ActiveMode,
  R extends AvailableRuleset<M>,
>(
  mode: M,
  ruleset: R,
  rankingSystem: Brand<string> | LeaderboardRankingSystem
): rankingSystem is LeaderboardRankingSystem {
  return (havingRankingSystem[mode] as typeof havingRankingSystem[Mode.Osu])[ruleset].leaderboardRankingSystem.includes(rankingSystem as any)
}
