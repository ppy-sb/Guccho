import type {
  AvailableRuleset,
  LeaderboardRankingSystem,
  Mode,
  RankingSystem,
  Ruleset,
} from './common'
import type { Brand } from './internal-utils'

export type ServerRankingSystemDef = {
  [M in Mode]: {
    [R in AvailableRuleset<M>]: {
      leaderboardRankingSystem: readonly LeaderboardRankingSystem[]
      rankingSystem: readonly RankingSystem[]
    }
  }
}

export type AssertHasRuleset = <M extends Mode>(
  mode: M,
  ruleset: Ruleset
) => ruleset is AvailableRuleset<M>

export type AssertHasRankingSystem = <
  M extends Mode,
  R extends AvailableRuleset<M>,
>(
  mode: M,
  ruleset: R,
  rankingSystem: Brand<string> | RankingSystem
) => rankingSystem is RankingSystem

export type AssertHasLeaderboardRankingSystem = <
  M extends Mode,
  R extends AvailableRuleset<M>,
>(
  mode: M,
  ruleset: R,
  rankingSystem: Brand<string> | LeaderboardRankingSystem
) => rankingSystem is LeaderboardRankingSystem
