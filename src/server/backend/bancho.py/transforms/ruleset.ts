import type * as schema from '../drizzle/schema'
import type { LeaderboardRankingSystem } from '~/def/common'
import type { UserModeRulesetStatistics } from '~/def/statistics'
import { Rank } from '~/def'

export function createRulesetData<RankingSystem extends LeaderboardRankingSystem>({
  databaseResult: dbResult,
  livePPRank,
}: {
  databaseResult?: {
    stat: typeof schema.stats.$inferSelect

    ppv2Rank: number
    ppv2CountryRank: number

    totalScoreRank: number
    totalScoreCountryRank: number

    rankedScoreRank: number
    rankedScoreCountryRank: number
  }
  livePPRank?: {
    rank: number | null
    countryRank: number | null
  }
}) {
  if (dbResult == null) {
    return {
      [Rank.PPv2]: {
        rank: 0,
        performance: 0,
      },
      [Rank.RankedScore]: {
        rank: 0,
        score: BigInt(0),
      },
      [Rank.TotalScore]: {
        rank: 0,
        score: BigInt(0),
      },

      playCount: 0,
      playTime: 0,
      totalHits: 0,
      level: 0,
      maxCombo: 0,
      replayWatchedByOthers: 0,
      scoreRankComposition: {
        ssh: 0,
        ss: 0,
        sh: 0,
        s: 0,
        a: 0,
        b: 0,
        c: 0,
        d: 0,
        f: 0,
      },
    } as UserModeRulesetStatistics<RankingSystem>
  }

  return {
    [Rank.PPv2]: {
      rank: livePPRank?.rank || dbResult.ppv2Rank || undefined,
      countryRank: livePPRank?.countryRank || dbResult.ppv2CountryRank || undefined,
      performance: dbResult.stat.pp,
    },
    [Rank.RankedScore]: {
      rank: dbResult.rankedScoreRank || undefined,
      countryRank: dbResult.rankedScoreCountryRank || undefined,
      score: dbResult.stat.rankedScore,
    },
    [Rank.TotalScore]: {
      rank: dbResult.totalScoreRank || undefined,
      countryRank: dbResult.totalScoreCountryRank || undefined,
      score: dbResult.stat.totalScore,
    },
    playCount: dbResult.stat.plays,
    playTime: dbResult.stat.playTime,
    totalHits: dbResult.stat.totalHits,
    level: getLevelWithProgress(dbResult.stat.totalScore),
    maxCombo: dbResult.stat.maxCombo,
    replayWatchedByOthers: dbResult.stat.replayViews,
    scoreRankComposition: {
      ssh: dbResult.stat.xhCount,
      ss: dbResult.stat.xCount,
      sh: dbResult.stat.shCount,
      s: dbResult.stat.sCount,
      a: dbResult.stat.aCount,
      b: 0,
      c: 0,
      d: 0,
      f: 0,
    },
  } as UserModeRulesetStatistics<RankingSystem>
}
