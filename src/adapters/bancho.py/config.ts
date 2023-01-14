import type { Feature, Mode, OverallLeaderboardRankingSystem, RankingSystem, Ruleset } from '~/types/common'

export type Id = number

export const supportedModes: Mode[] = ['osu', 'taiko', 'fruits', 'mania']
export const supportedRulesets: Ruleset[] = ['standard', 'relax', 'autopilot']
export const supportedOverallLeaderboardRankingSystems: OverallLeaderboardRankingSystem[] = ['ppv2', 'rankedScore', 'totalScore']
export const supportedRankingSystems: RankingSystem[] = ['ppv2', 'score']

export const supportedFeatures: Set<Feature> = new Set([
  'userpage',
])

export * from '~/adapters/bancho.py/transforms/id-conversion'
