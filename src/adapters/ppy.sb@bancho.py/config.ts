import * as Active from '../bancho.py/config'
import type { GrandLeaderboardRankingSystem, Mode, RankingSystem, Ruleset } from '~/types/common'
// defaults
export type Id = Active.Id
export const supportedModes: Mode[] = Active.supportedModes || []
export const supportedRulesets: Ruleset[] = Active.supportedRulesets || []
export const supportedGrandLeaderboardRankingSystems: GrandLeaderboardRankingSystem[] = Active.supportedGrandLeaderboardRankingSystems || []
export const supportedRankingSystems: RankingSystem[] = Active.supportedRankingSystems || []

