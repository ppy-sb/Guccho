import type {
  features,
  rankingSystemDef,
} from './defs'
import type { Enumerate, U2I } from './internal-utils'

type ModeRulesetRankingSystemDef = typeof rankingSystemDef

export type ActiveMode = keyof ModeRulesetRankingSystemDef
export type ActiveRuleset = keyof U2I<ModeRulesetRankingSystemDef[ActiveMode]>

export type AvailableRuleset<M extends ActiveMode, Available = ActiveRuleset> =
  keyof ModeRulesetRankingSystemDef[M] & Available

export type AvailableRankingSystem<
  M extends ActiveMode,
  R extends AvailableRuleset<M>,
> = ModeRulesetRankingSystemDef[M][R]

export type AllRankingSystemDef =
  ModeRulesetRankingSystemDef[ActiveMode][keyof ModeRulesetRankingSystemDef[ActiveMode]]

export type PPRankingSystem =
  AllRankingSystemDef['rankingSystem']['ppRankingSystem'][number]
export type ScoreRankingSystem =
  AllRankingSystemDef['rankingSystem']['scoreRankingSystem'][number]
export type RankingSystem = PPRankingSystem | ScoreRankingSystem

export type LeaderboardPPRankingSystem =
  AllRankingSystemDef['leaderboardRankingSystem']['ppRankingSystem'][number]
export type LeaderboardScoreRankingSystem =
  AllRankingSystemDef['leaderboardRankingSystem']['scoreRankingSystem'][number]

export type LeaderboardRankingSystem =
  | LeaderboardPPRankingSystem
  | LeaderboardScoreRankingSystem

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
