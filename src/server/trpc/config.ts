import type { Feature, OverallLeaderboardRankingSystem, Mode, RankingSystem, Ruleset } from '~/types/common'
import * as Active from '$active/config'
// defaults
export type Id = Active.Id
export const supportedModes: Mode[] = Active.supportedModes || []
export const supportedRulesets: Ruleset[] = Active.supportedRulesets || []
export const supportedOverallLeaderboardRankingSystems: OverallLeaderboardRankingSystem[] = Active.supportedOverallLeaderboardRankingSystems || []
export const supportedRankingSystems: RankingSystem[] = Active.supportedRankingSystems || []

export const supportedFeatures: Set<Feature> = Active.supportedFeatures || new Set()
