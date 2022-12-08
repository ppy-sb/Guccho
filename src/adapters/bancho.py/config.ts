import type { Mode, RankingSystem, Ruleset } from '~/types/common'

export type IdType = number

export const supportedModes: Mode[] = ['osu', 'taiko', 'fruits', 'mania']
export const supportedRulesets: Ruleset[] = ['standard', 'relax', 'autopilot']
export const supportedRankingSystems: RankingSystem[] = ['ppv2', 'rankedScore', 'totalScore']
