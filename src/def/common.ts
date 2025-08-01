import type { Rank } from '.'

export type LeaderboardScoreRankingSystem = Rank.RankedScore | Rank.TotalScore
export type PPRankingSystem = Rank.PPv1 | Rank.PPv2
export type LeaderboardPPRankingSystem = PPRankingSystem
export type LeaderboardRankingSystem = LeaderboardPPRankingSystem | LeaderboardScoreRankingSystem

export type RulesetChecked<R> = R & { _checked: true }
