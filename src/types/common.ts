import type {
  features,
  grades,
  modeRulesetRankingSystemDef,
  mutualRelationship,
  relationship,
  scopes,
} from './defs'
import type { Enumerate, U2I } from './internal-utils'
export * from './defs'

export type Relationship = (typeof relationship)[number]
export type MutualRelationship = (typeof mutualRelationship)[number]

type ModeRulesetRankingSystemDef = typeof modeRulesetRankingSystemDef

export type Mode = keyof ModeRulesetRankingSystemDef
export type Ruleset = keyof U2I<ModeRulesetRankingSystemDef[Mode]>

export type RulesetAvailableInMode = {
  [R in Ruleset]: {
    [M in keyof ModeRulesetRankingSystemDef]: ModeRulesetRankingSystemDef[M][R &
    keyof ModeRulesetRankingSystemDef[M]] extends never
      ? never
      : M;
  }[keyof ModeRulesetRankingSystemDef];
}
export type StandardAvailable = RulesetAvailableInMode['standard']
export type RelaxAvailable = RulesetAvailableInMode['relax']
export type AutopilotAvailable = RulesetAvailableInMode['autopilot']

export type PPRankingSystem =
  ModeRulesetRankingSystemDef[Mode][keyof ModeRulesetRankingSystemDef[Mode]]['rankingSystem']['ppRankingSystem'][number]
export type ScoreRankingSystem =
  ModeRulesetRankingSystemDef[Mode][keyof ModeRulesetRankingSystemDef[Mode]]['rankingSystem']['scoreRankingSystem'][number]
export type RankingSystem = PPRankingSystem | ScoreRankingSystem

export type LeaderboardPPRankingSystem =
  ModeRulesetRankingSystemDef[Mode][keyof ModeRulesetRankingSystemDef[Mode]]['leaderboardRankingSystem']['ppRankingSystem'][number]
export type LeaderboardScoreRankingSystem =
  ModeRulesetRankingSystemDef[Mode][keyof ModeRulesetRankingSystemDef[Mode]]['leaderboardRankingSystem']['scoreRankingSystem'][number]
export type LeaderboardRankingSystem =
  | LeaderboardPPRankingSystem
  | LeaderboardScoreRankingSystem

export type Scope = (typeof scopes)[number]
export type Grade = (typeof grades)[number]
export type Feature = (typeof features)[number]

export type Awaitable<T> = T | PromiseLike<T>
export type NumberRange<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>
export type UserpageShowType = 'tab' | 'dropdown' | 'hidden'
export type ServerConfig<
  AvailableRankingSystem extends LeaderboardRankingSystem,
> = Record<
  AvailableRankingSystem,
  {
    userpage: {
      show: UserpageShowType
    }
    name: string
  }
>
// export type AutoAvailable<_Ruleset extends Ruleset> = {
//   'standard': StandardAvailable
//   'relax': RelaxAvailable
//   'autopilot': AutopilotAvailable
// }[_Ruleset]
