import type {
  features,
  grades,
  modeRulesetRankingSystemDef,
  mutualRelationship,
  relationship,
  scopes,
} from './defs'
import type { Enumerate, U2I } from './internal-utils'

export type Relationship = (typeof relationship)[number]
export type MutualRelationship = (typeof mutualRelationship)[number]

type ModeRulesetRankingSystemDef = typeof modeRulesetRankingSystemDef

export type Mode = keyof ModeRulesetRankingSystemDef
export type Ruleset = keyof U2I<ModeRulesetRankingSystemDef[Mode]>

export type AvailableRuleset<M extends Mode, Available = Ruleset> =
  keyof ModeRulesetRankingSystemDef[M] & Available

export type AvailableRankingSystem<
  M extends Mode,
  R extends AvailableRuleset<M>,
> = ModeRulesetRankingSystemDef[M][R]

export type AllRankingSystemDefs =
  ModeRulesetRankingSystemDef[Mode][keyof ModeRulesetRankingSystemDef[Mode]]

export type PPRankingSystem =
  AllRankingSystemDefs['rankingSystem']['ppRankingSystem'][number]
export type ScoreRankingSystem =
  AllRankingSystemDefs['rankingSystem']['scoreRankingSystem'][number]
export type RankingSystem = PPRankingSystem | ScoreRankingSystem

export type LeaderboardPPRankingSystem =
  AllRankingSystemDefs['leaderboardRankingSystem']['ppRankingSystem'][number]
export type LeaderboardScoreRankingSystem =
  AllRankingSystemDefs['leaderboardRankingSystem']['scoreRankingSystem'][number]

export type LeaderboardRankingSystem =
  | LeaderboardPPRankingSystem
  | LeaderboardScoreRankingSystem

export type Scope = (typeof scopes)[number]
export type Grade = (typeof grades)[number]
export type Feature = (typeof features)[number]

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
