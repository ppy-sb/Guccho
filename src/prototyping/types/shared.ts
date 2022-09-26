
export type Mode = 'osu' | 'taiko' | 'fruits' | 'mania'
export type Ruleset = 'standard' | 'relax' | 'autopilot'

export type StandardAvailable = Mode
export type RelaxAvailable = 'osu' | 'taiko' | 'fruits'
export type AutopilotAvailable = 'osu'

export type ScoreRankingSystem = 'rankedScores' | 'totalScores'
export type PPRankingSystem = 'ppv2' | 'ppv1'
export type RankingSystem = PPRankingSystem | ScoreRankingSystem

export type VisibilityScope = 'nobody' | 'friends' | 'public'

// utils
export type OmitNever<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] }
export type Awaitable<T> = T | Promise<T>
