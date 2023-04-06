import type { Brand } from './internal-utils'
import type {
  AvailableRuleset,
  LeaderboardRankingSystem,
  Mode,
  RankingSystem,
  Ruleset,

} from './common'

export type ServerRankingSystemDef = {
  [M in Mode]: {
    [R in AvailableRuleset<M>]: {
      leaderboardRankingSystem: readonly LeaderboardRankingSystem[]
      rankingSystem: readonly RankingSystem[]
    }
  }
}

export type HasRuleset = <M extends Mode>(
  mode: M,
  ruleset: Ruleset
) => ruleset is AvailableRuleset<M>

export type HasRankingSystem = <
  M extends Mode,
  R extends AvailableRuleset<M>,
>(
  mode: M,
  ruleset: R,
  // rankingSystem: RankingSystem
  rankingSystem: Brand<string> | RankingSystem
) => rankingSystem is RankingSystem

export type HasLeaderboardRankingSystem = <
  M extends Mode,
  R extends AvailableRuleset<M>,
>(
  mode: M,
  ruleset: R,
  // rankingSystem: LeaderboardRankingSystem
  rankingSystem: Brand<string> | LeaderboardRankingSystem
) => rankingSystem is LeaderboardRankingSystem
