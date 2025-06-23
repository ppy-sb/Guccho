import { and, eq, inArray, sql } from 'drizzle-orm'
import { useDrizzle } from '../source/drizzle'
import * as schema from '../../drizzle/schema'
import { BanchoPyRankedStatus } from '../../enums'
import { AdminScoreProvider as Base } from '$base/server/admin/score'

export class AdminScoreProvider extends Base<number> implements Base<number> {
  drizzle = useDrizzle(schema)

  async metrics(input: Base.MetricsParam): Promise<Base.Metrics> {
    const now = Date.now()
    const period = input.active === 'daily' ? 24 * 60 * 60 * 1000 : input.active === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000
    const since = new Date(now - period)
    const res = await this.drizzle.select({
      total: sql`count(*)`.mapWith(Number),
      new: sql`count(if(${schema.scores.playTime} > ${since}, 1, null))`.mapWith(Number),
    })
      .from(schema.scores)
    return {
      count: {
        total: res[0].total,
        new: res[0].new,
      },
    }
  }
}
