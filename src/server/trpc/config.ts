import type { Feature, GrandLeaderboardRankingSystem, Mode, RankingSystem, Ruleset } from '~/types/common'
import * as Providers from '$active/client'
import * as Active from '$active/config'
// defaults
export type Id = Active.Id
export const supportedModes: Mode[] = Active.supportedModes || []
export const supportedRulesets: Ruleset[] = Active.supportedRulesets || []
export const supportedGrandLeaderboardRankingSystems: GrandLeaderboardRankingSystem[] = Active.supportedGrandLeaderboardRankingSystems || []
export const supportedRankingSystems: RankingSystem[] = Active.supportedRankingSystems || []

export const supportedFeatures: Partial<Record<Feature, boolean>> = {
  'user.userpage': Providers.UserDataProvider.prototype.changeUserpage !== undefined,
}
