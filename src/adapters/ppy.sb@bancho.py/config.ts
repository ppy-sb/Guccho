import * as Active from '../bancho.py/config'

import type { Feature, GrandLeaderboardRankingSystem, Mode, RankingSystem, Ruleset } from '~/types/common'
// defaults
export type Id = Active.Id
export const supportedModes: Mode[] = Active.supportedModes || []
export const supportedRulesets: Ruleset[] = Active.supportedRulesets || []
export const supportedGrandLeaderboardRankingSystems: GrandLeaderboardRankingSystem[] = Active.supportedGrandLeaderboardRankingSystems || []
export const supportedRankingSystems: RankingSystem[] = Active.supportedRankingSystems || []

export const supportedFeatures = Active.supportedFeatures || new Set<Feature>()
