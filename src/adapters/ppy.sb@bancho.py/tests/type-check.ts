// If any error is shown, there's an type error in your adapter, fix your adapter.
// don't edit this file unless you understand what you are doing.
/* eslint-disable sort-imports */
import type {
  // data providers
  LeaderboardProvider,
  MapProvider,
  ScoreProvider,
  ServiceStatusProvider,
  UserProvider,
  UserRelationProvider,
} from '../server'
import type {

  // transforms
  idToString,
  stringToId,
  scoreIdToString,
  stringToScoreId,

  // guards
  hasLeaderboardRankingSystem,
  hasRankingSystem,
  hasRuleset,
  modes,
  rulesets,

  // types
  Id,
  ScoreId,
} from '..'

import type {
  LeaderboardProvider as BaseLeaderboardProvider,
  MapProvider as BaseMapProvider,
  ScoreProvider as BaseScoreProvider,
  ServiceStatusProvider as BaseServerStatusProvider,
  UserProvider as BaseUserProvider,
  UserRelationProvider as BaseUserRelationProvider,

} from '~/adapters/base/server'
import type {
  idToString as BaseIdToString,
  modes as BaseModes,
  rulesets as BaseRulesets,
  scoreIdToString as BaseScoreIdToString,
  stringToId as BaseStringToId,
  stringToScoreId as BaseStringToScoreId,
  hasLeaderboardRankingSystem as BaseHasLeaderboardRankingSystem,
  hasRankingSystem as BaseHasRankingSystem,
  hasRuleset as BaseHasRuleset,
} from '$def'

interface ShouldMatch {
  LeaderboardProvider: BaseLeaderboardProvider<any>
  MapProvider: BaseMapProvider<any>
  ScoreProvider: BaseScoreProvider<any, any>
  UserProvider: BaseUserProvider<any>
  UserRelationProvider: BaseUserRelationProvider<any>
  ServiceStatusProvider: BaseServerStatusProvider

  idToString: typeof BaseIdToString
  stringToId: typeof BaseStringToId
  scoreIdToString: typeof BaseStringToScoreId
  stringToScoreId: typeof BaseScoreIdToString
  hasLeaderboardRankingSystem: typeof BaseHasLeaderboardRankingSystem
  hasRankingSystem: typeof BaseHasRankingSystem
  hasRuleset: typeof BaseHasRuleset

  modes: typeof BaseModes
  rulesets: typeof BaseRulesets
}

// @ts-expect-error namespace type check
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ActiveNameSpace extends ShouldMatch {
  idToString: typeof idToString
  stringToId: typeof stringToId
  scoreIdToString: typeof scoreIdToString
  stringToScoreId: typeof stringToScoreId
  hasLeaderboardRankingSystem: typeof hasLeaderboardRankingSystem
  hasRankingSystem: typeof hasRankingSystem
  hasRuleset: typeof hasRuleset

  modes: typeof modes
  rulesets: typeof rulesets

  LeaderboardProvider: InstanceType<typeof LeaderboardProvider>
  MapProvider: InstanceType<typeof MapProvider>
  ScoreProvider: InstanceType<typeof ScoreProvider>
  UserProvider: InstanceType<typeof UserProvider>
  UserRelationProvider: InstanceType<typeof UserRelationProvider>
  ServiceStatusProvider: InstanceType<typeof ServiceStatusProvider>
  Id: Id
  ScoreId: ScoreId
}
