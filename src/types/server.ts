import type {
  AvailableRuleset,
  LeaderboardRankingSystem,
  Mode,
  RankingSystem,
  Ruleset,
} from './common'
import type { Brand } from './internal-utils'

export type ServerOverallRankingSystemDef = {
  [M in Mode]: Record<
    Ruleset & AvailableRuleset<M>,
    readonly LeaderboardRankingSystem[]
  >;
}
export type ServerRankingSystemDef = {
  [M in Mode]: Record<Ruleset & AvailableRuleset<M>, readonly RankingSystem[]>;
}

export type AssertHasRuleset = <M extends Mode> (ruleset: Ruleset, mode: M) => ruleset is Ruleset & AvailableRuleset<M>

export type AssertHasRankingSystem = <M extends Mode, R extends Ruleset & AvailableRuleset<M>>(
  rankingSystem: Brand<string> | RankingSystem,
  opt: { mode: M; ruleset: R }
) => rankingSystem is RankingSystem

export type AssertHasOverallRankingSystem = <M extends Mode, R extends Ruleset & AvailableRuleset<M>>(
  rankingSystem: Brand<string> | LeaderboardRankingSystem,
  opt: { mode: M; ruleset: R }
) => rankingSystem is LeaderboardRankingSystem
