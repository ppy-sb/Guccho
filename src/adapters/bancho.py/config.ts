import type { Feature, GrandLeaderboardRankingSystem, Mode, RankingSystem, Ruleset } from '~/types/common'

export type Id = number

export const supportedModes: Mode[] = ['osu', 'taiko', 'fruits', 'mania']
export const supportedRulesets: Ruleset[] = ['standard', 'relax', 'autopilot']
export const supportedGrandLeaderboardRankingSystems: GrandLeaderboardRankingSystem[] = ['ppv2', 'rankedScore', 'totalScore']
export const supportedRankingSystems: RankingSystem[] = ['ppv2', 'score']

export const supportedFeatures: Feature[] = [
  'user.userpage',
]
