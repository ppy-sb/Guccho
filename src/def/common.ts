import type { Enumerate, U2I } from './internal-utils'
import type {
  ModeRulesetRankingSystemDef,
} from '.'

export type ActiveMode = keyof ModeRulesetRankingSystemDef
export type ActiveRuleset = keyof U2I<ModeRulesetRankingSystemDef[ActiveMode]>

export type AvailableRuleset<M extends ActiveMode, Available = ActiveRuleset> =
  keyof ModeRulesetRankingSystemDef[M] & Available

export type AvailableRankingSystem<
  M extends ActiveMode,
  R extends AvailableRuleset<M>,
> = ModeRulesetRankingSystemDef[M][R]

export type RankingSystemDef =
  ModeRulesetRankingSystemDef[ActiveMode][keyof ModeRulesetRankingSystemDef[ActiveMode]]

export type PPRankingSystem =
  RankingSystemDef['rankingSystem']['ppRankingSystem'][number]
export type ScoreRankingSystem =
  RankingSystemDef['rankingSystem']['scoreRankingSystem'][number]
export type RankingSystem = PPRankingSystem | ScoreRankingSystem

export type LeaderboardPPRankingSystem =
  RankingSystemDef['leaderboardRankingSystem']['ppRankingSystem'][number]
export type LeaderboardScoreRankingSystem =
  RankingSystemDef['leaderboardRankingSystem']['scoreRankingSystem'][number]

export type LeaderboardRankingSystem =
  | LeaderboardPPRankingSystem
  | LeaderboardScoreRankingSystem

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
