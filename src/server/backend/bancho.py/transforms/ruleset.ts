import type { Stat } from 'prisma-client-bancho-py'

import type { LeaderboardRankingSystem } from '~/def/common'
import type { UserModeRulesetStatistics } from '~/def/statistics'
import { Rank } from '~/def'

export function createRulesetData<RankingSystem extends LeaderboardRankingSystem>({
  databaseResult: dbResult,
  ranks,
  livePPRank,
}: {
  databaseResult?: Stat
  ranks?: {
    ppv2Rank: number | bigint
    totalScoreRank: number | bigint
    rankedScoreRank: number | bigint
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
      rank: livePPRank?.rank || Number(ranks?.ppv2Rank) || undefined,
      countryRank: livePPRank?.countryRank || undefined,
      performance: dbResult.pp,
    },
    [Rank.RankedScore]: {
      rank: Number(ranks?.rankedScoreRank) || undefined,
      score: dbResult.rankedScore,
    },
    [Rank.TotalScore]: {
      rank: Number(ranks?.totalScoreRank) || undefined,
      score: dbResult.totalScore,
    },
    playCount: dbResult.plays,
    playTime: dbResult.playTime,
    totalHits: dbResult.totalHits,
    level: getLevelWithProgress(dbResult.totalScore),
    maxCombo: dbResult.maxCombo,
    replayWatchedByOthers: dbResult.replayViews,
    scoreRankComposition: {
      ssh: dbResult.xhCount,
      ss: dbResult.xCount,
      sh: dbResult.shCount,
      s: dbResult.sCount,
      a: dbResult.aCount,
      b: 0,
      c: 0,
      d: 0,
      f: 0,
    },
  } as UserModeRulesetStatistics<RankingSystem>
}
