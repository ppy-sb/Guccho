import type { Mode, OverallLeaderboardRankingSystem, RankingSystem, Ruleset } from './common'
import type { AvailableRuleset } from './user'

export type ServerOverallRankingSystemDef = {
  [M in Mode]:
  Record<
    Ruleset & AvailableRuleset<M>,
    OverallLeaderboardRankingSystem[]
  >
}
export type ServerRankingSystemDef = {
  [M in Mode]:
  Record<
    Ruleset & AvailableRuleset<M>,
    RankingSystem[]
  >
}

export type AssertRankingSystem = (rankingSystem: RankingSystem | string, opt: { mode: Mode; ruleset: Ruleset }) => rankingSystem is RankingSystem
export type AssertOverallRankingSystem = (rankingSystem: OverallLeaderboardRankingSystem | string, opt: { mode: Mode; ruleset: Ruleset }) => rankingSystem is OverallLeaderboardRankingSystem
