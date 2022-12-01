import type { RankingSystem, Mode as _Mode, Ruleset as _Ruleset } from '~/types/common'

export type IdType = number

export const supportedModes: _Mode[] = ['osu', 'taiko', 'fruits', 'mania']
export const supportedRulesets: _Ruleset[] = ['standard', 'relax', 'autopilot']
export const supportedRankingSystems: RankingSystem[] = ['ppv2', 'rankedScore', 'totalScore']
