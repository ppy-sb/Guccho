import type { PrismaClient } from '.prisma/bancho.py'
import type { Id } from '../exports'
import { prismaClient } from '.'
import { BanchoPyMode } from '~/adapters/bancho.py/enums'
import { createRulesetData } from '~/adapters/bancho.py/transforms'

import type { UserDataProvider as Base } from '$def/client/user'
import type { LeaderboardRankingSystem, Mode, Ruleset } from '~/types/common'

import type { UserStatistic } from '~/types/user'

import { UserDataProvider as BanchoPyUser } from '~/adapters/bancho.py/client'

export class UserDataProvider extends BanchoPyUser implements Base<Id> {
  db: PrismaClient

  constructor() {
    super()
    this.db = prismaClient
  }

  async getStatistics({ id, country }: { id: Id; country: string }) {
    const [results, ranks, livePPRank] = await Promise.all([
      this.db.stat.findMany({
        where: {
          id,
        },
      }),

      this.db.$queryRaw<
        Array<{
          id: Id
          mode: number
          ppv2Rank: bigint
          totalScoreRank: bigint
          rankedScoreRank: bigint
        }>
      >/* sql */`
SELECT 
  id,
  mode,
  (
    SELECT COUNT(*) + 1
    FROM stats s
      LEFT JOIN users u on s.id = u.id
    WHERE s.mode = r.mode
      AND u.priv > 2
      AND s.pp > r.pp
  ) AS ppv2Rank,
  (
    SELECT COUNT(*) + 1
    FROM stats s
      LEFT JOIN users u on s.id = u.id
    WHERE s.mode = r.mode
      AND u.priv > 2
      AND s.tscore > r.tscore
  ) AS totalScoreRank,
  (
    SELECT COUNT(*) + 1
    FROM stats s
      LEFT JOIN users u on s.id = u.id
    WHERE s.mode = r.mode
      AND u.priv > 2
      AND s.rscore > r.rscore
  ) AS rankedScoreRank
FROM stats r
WHERE id = ${id}
  `.catch((_) => {
          console.error(_)
          return []
        }),

      this.redisClient
        ? {
            osu: {
              standard: await this.getLiveRank(
                id,
                BanchoPyMode.osuStandard,
                country,
              ),
              relax: await this.getLiveRank(id, BanchoPyMode.osuRelax, country),
              autopilot: await this.getLiveRank(
                id,
                BanchoPyMode.osuAutopilot,
                country,
              ),
            },
            taiko: {
              standard: await this.getLiveRank(
                id,
                BanchoPyMode.taikoStandard,
                country,
              ),
              relax: await this.getLiveRank(id, BanchoPyMode.taikoRelax, country),
            },
            fruits: {
              standard: await this.getLiveRank(
                id,
                BanchoPyMode.fruitsStandard,
                country,
              ),
              relax: await this.getLiveRank(id, BanchoPyMode.fruitsRelax, country),
            },
            mania: {
              standard: await this.getLiveRank(
                id,
                BanchoPyMode.maniaStandard,
                country,
              ),
            },
          }
        : undefined,
    ])

    const statistics: UserStatistic<
      Id,
      Mode,
      Ruleset,
      LeaderboardRankingSystem
    > = {
      osu: {
        standard: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.osuStandard,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.osuStandard),
          livePPRank: livePPRank?.osu.standard,
        }),
        relax: createRulesetData({
          databaseResult: results.find(i => i.mode === BanchoPyMode.osuRelax),
          ranks: ranks.find(i => i.mode === BanchoPyMode.osuRelax),
          livePPRank: livePPRank?.osu.relax,
        }),
        autopilot: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.osuAutopilot,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.osuAutopilot),
          livePPRank: livePPRank?.osu.autopilot,
        }),
      },
      taiko: {
        standard: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.taikoStandard,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.taikoStandard),
          livePPRank: livePPRank?.taiko.standard,
        }),
        relax: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.taikoRelax,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.taikoRelax),
          livePPRank: livePPRank?.taiko.relax,
        }),
      },
      fruits: {
        standard: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.fruitsStandard,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.fruitsStandard),
          livePPRank: livePPRank?.fruits.standard,
        }),
        relax: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.fruitsRelax,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.fruitsRelax),
          livePPRank: livePPRank?.fruits.relax,
        }),
      },
      mania: {
        standard: createRulesetData({
          databaseResult: results.find(
            i => i.mode === BanchoPyMode.maniaStandard,
          ),
          ranks: ranks.find(i => i.mode === BanchoPyMode.maniaStandard),
          livePPRank: livePPRank?.mania.standard,
        }),
      },
    }
    return statistics
  }
}
