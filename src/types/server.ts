import type { Mode, OverallLeaderboardRankingSystem, RankingSystem, Ruleset } from './common'
import type { Brand } from './internal-utils'
import type { AvailableRuleset } from './user'

export type ServerOverallRankingSystemDef = {
  [M in Mode]: Record<
    Ruleset & AvailableRuleset<M>,
    readonly OverallLeaderboardRankingSystem[]
  >
}
export type ServerRankingSystemDef = {
  [M in Mode]: Record<
    Ruleset & AvailableRuleset<M>,
    readonly RankingSystem[]
  >
}

export type AssertHasRankingSystem = <M extends Mode>(rankingSystem: Brand<string> | RankingSystem, opt: { mode: M; ruleset: Ruleset & AvailableRuleset<M> }) => rankingSystem is RankingSystem
export type AssertHasOverallRankingSystem = <M extends Mode>(rankingSystem: Brand<string> | OverallLeaderboardRankingSystem, opt: { mode: M; ruleset: Ruleset & AvailableRuleset<M> }) => rankingSystem is OverallLeaderboardRankingSystem
