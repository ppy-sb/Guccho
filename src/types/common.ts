import type { autopilotAvailable, features, grades, leaderboardRankingSystem, leaderboardScoreRankingSystem, mode, mutualRelationship, ppRankingSystem, rankingSystem, relationship, relaxAvailable, ruleset, scopes, scoreRankingSystem } from './defs'
import type { Enumerate } from './internal-utils'
export * from './defs'
export type Mode = typeof mode[number]
export type Ruleset = typeof ruleset[number]
export type Relationship = typeof relationship[number]
export type MutualRelationship = typeof mutualRelationship[number]
export type StandardAvailable = Mode
export type RelaxAvailable = typeof relaxAvailable[number]
export type AutopilotAvailable = typeof autopilotAvailable[number]
export type PPRankingSystem = typeof ppRankingSystem[number]
export type ScoreRankingSystem = typeof scoreRankingSystem[number]
export type RankingSystem = typeof rankingSystem[number]
export type LeaderboardPPRankingSystem = PPRankingSystem
export type LeaderboardScoreRankingSystem = typeof leaderboardScoreRankingSystem[number]
export type LeaderboardRankingSystem = typeof leaderboardRankingSystem[number]
export type Scope = typeof scopes[number]
export type Grade = typeof grades[number]
export type Feature = typeof features[number]

export type Awaitable<T> = T | PromiseLike<T>
export type NumberRange<F extends number, T extends number> = Exclude<
Enumerate<T>,
Enumerate<F>
>
export type UserpageShowType = 'tab' | 'dropdown' | 'hidden'
export type ServerConfig<AvailableRankingSystem extends LeaderboardRankingSystem> = Record<AvailableRankingSystem, {
  userpage: {
    show: UserpageShowType
  }
  name: string
}>
export type AutoAvailable<_Ruleset extends Ruleset> = {
  'standard': StandardAvailable
  'relax': RelaxAvailable
  'autopilot': AutopilotAvailable
}[_Ruleset]
