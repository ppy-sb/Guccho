import type { Brand, U2I } from '~/def/internal-utils'
import type { Feature } from '~/def/features'

import { LeaderboardScoreRank, Mode, Rank, Ruleset } from '~/def'

const ppRankingSystem = [Rank.PPv1, Rank.PPv2] as const
const scoreRankingSystem = [Rank.Score] as const

const leaderboardPPRankingSystem = ppRankingSystem
const leaderboardScoreRankingSystem = [
  LeaderboardScoreRank.RankedScore,
  LeaderboardScoreRank.TotalScore,
] as const

const defaultConfigure = {
  leaderboardRankingSystem: {
    ppRankingSystem: leaderboardPPRankingSystem,
    scoreRankingSystem: leaderboardScoreRankingSystem,
  },
  rankingSystem: {
    ppRankingSystem,
    scoreRankingSystem,
  },
}

export const rankingSystemDef = {
  [Mode.Osu]: {
    [Ruleset.Standard]: defaultConfigure,
    [Ruleset.Relax]: defaultConfigure,
    [Ruleset.Autopilot]: defaultConfigure,
  },
  [Mode.Taiko]: {
    [Ruleset.Standard]: defaultConfigure,
    [Ruleset.Relax]: defaultConfigure,
  },
  [Mode.Fruits]: {
    [Ruleset.Standard]: defaultConfigure,
    [Ruleset.Relax]: defaultConfigure,
  },
  [Mode.Mania]: {
    [Ruleset.Standard]: defaultConfigure,
  },
} as const

export type ModeRulesetRankingSystemDef = typeof rankingSystemDef

const _mode = new Set<Mode>()
const _ruleset = new Set<Ruleset>()

const _ppRankingSystem = new Set<PPRankingSystem>()
const _scoreRankingSystem = new Set<ScoreRankingSystem>()

const _leaderboardPPRankingSystem = new Set<LeaderboardPPRankingSystem>()
const _leaderboardScoreRankingSystem = new Set<LeaderboardScoreRankingSystem>()

for (const key of Object.keys(rankingSystemDef)) {
  _mode.add(key as unknown as Mode)
  const ruleset = rankingSystemDef[key as unknown as Mode]
  for (const rule in ruleset) {
    _ruleset.add(rule as unknown as Ruleset)
    const rankingSystemDefs = ruleset[rule as unknown as keyof typeof ruleset]

    rankingSystemDefs.leaderboardRankingSystem.ppRankingSystem.map(rs =>
      _leaderboardPPRankingSystem.add(rs),
    )
    rankingSystemDefs.leaderboardRankingSystem.scoreRankingSystem.map(rs =>
      _leaderboardScoreRankingSystem.add(rs),
    )

    rankingSystemDefs.rankingSystem.ppRankingSystem.map(rs =>
      _ppRankingSystem.add(rs),
    )
    rankingSystemDefs.rankingSystem.scoreRankingSystem.map(rs =>
      _scoreRankingSystem.add(rs),
    )
  }
}

export const modes = [..._mode] as const
export const rulesets = [..._ruleset] as const

export const ppRankingSystems = [..._ppRankingSystem] as const
export const scoreRankingSystems = [..._scoreRankingSystem] as const
export const rankingSystems = [...ppRankingSystems, ...scoreRankingSystems] as const

const leaderboardPPRankingSystems = [..._leaderboardPPRankingSystem] as const
const leaderboardScoreRankingSystems = [
  ..._leaderboardScoreRankingSystem,
] as const
export const leaderboardRankingSystems = [
  ...leaderboardPPRankingSystems,
  ...leaderboardScoreRankingSystems,
] as const

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

export type Id = any
export type ScoreId = any

export function idToString(id: Id): string {
  return id
}
export function stringToId(id: string): Id {
  return id
}
export function scoreIdToString(id: Id): string {
  return id
}
export function stringToScoreId(id: string): ScoreId {
  return id
}

export function hasRuleset<M extends ActiveMode>(mode: M, ruleset: ActiveRuleset): ruleset is ActiveRuleset & AvailableRuleset<M> {
  return false
}

export function hasRankingSystem<
  M extends ActiveMode,
  R extends AvailableRuleset<M>,
>(
  mode: M,
  ruleset: R,
  rankingSystem: Brand<string> | RankingSystem
): rankingSystem is RankingSystem {
  return false
}

export function hasLeaderboardRankingSystem<
  M extends ActiveMode,
  R extends AvailableRuleset<M>,
>(
  mode: M,
  ruleset: R,
  rankingSystem: Brand<string> | LeaderboardRankingSystem
): rankingSystem is LeaderboardRankingSystem {
  return false
}

export { userRoles } from '~/def/user'

export const features = new Set<Feature>([])
