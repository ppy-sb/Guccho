import * as Active from '../bancho.py/config'

import type { Feature, Mode, OverallLeaderboardRankingSystem, RankingSystem, Ruleset } from '~/types/common'
// defaults
export type Id = Active.Id
export const supportedModes: Mode[] = Active.supportedModes || []
export const supportedRulesets: Ruleset[] = Active.supportedRulesets || []
export const supportedOverallLeaderboardRankingSystems: OverallLeaderboardRankingSystem[] = Active.supportedOverallLeaderboardRankingSystems || []
export const supportedRankingSystems: RankingSystem[] = Active.supportedRankingSystems || []

export const supportedFeatures = Active.supportedFeatures || new Set<Feature>()

export * from '~/adapters/bancho.py/transforms/id-conversion'
