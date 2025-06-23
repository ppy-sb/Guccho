import { and, desc, eq, like, or, sql } from 'drizzle-orm'
import { type Id } from '../..'
import { fromRankingStatus, idToString, stringToId, toBanchoMode, toBeatmapSource, toBeatmapset, toRankingStatus } from '../../transforms'
import { useDrizzle } from '../source/drizzle'
import * as schema from '../../drizzle/schema'
import { BanchoPyRankedStatus } from '../../enums'
import { AdminMapProvider as Base } from '$base/server'
import { type PaginatedResult } from '~/def/pagination'

export class AdminMapProvider extends Base<Id, Id> implements Base<Id, Id> {
  static readonly idToString = idToString
  static readonly stringToId = stringToId

  drizzle = useDrizzle(schema)
  async search(opt: Base.SearchOpt): Promise<PaginatedResult<Base.SearchResultData<Id, Id>>> {
    const { keyword } = opt
    const idKw = stringToId(keyword)
    const _sql = this.drizzle.select({
      id: schema.sources.id,
      server: schema.sources.server,
      meta: {
        title: schema.beatmaps.title,
        artist: schema.beatmaps.artist,
      },
      beatmaps: sql<{
        version: string
        md5: string
        id: Id
        server: 'osu!' | 'private'
        status: BanchoPyRankedStatus
      }[]>`JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', ${schema.beatmaps.id},
          'md5', ${schema.beatmaps.md5},
          'version', ${schema.beatmaps.version},
          'server', ${schema.beatmaps.server},
          'status', ${schema.beatmaps.status}
        )
      )`,
    })
      .from(schema.sources)
      .innerJoin(schema.beatmaps, and(
        eq(schema.beatmaps.setId, schema.sources.id),
        eq(schema.beatmaps.server, schema.sources.server),
      ))
      .where(
        and(
          or(
            like(schema.beatmaps.version, `%${keyword}%`),
            like(schema.beatmaps.title, `%${keyword}%`),
            like(schema.beatmaps.artist, `%${keyword}%`),
            like(schema.beatmaps.creator, `%${keyword}%`),
            eq(schema.beatmaps.setId, idKw)?.if(!Number.isNaN(idKw)),
            eq(schema.beatmaps.id, idKw)?.if(!Number.isNaN(idKw)),
          )?.if(keyword),

          opt.mode === undefined ? undefined : eq(schema.beatmaps.mode, toBanchoMode(opt.mode)),
        )
      )
      .groupBy(schema.sources.id, schema.sources.server, schema.beatmaps.title, schema.beatmaps.artist)

    const total = await this.drizzle.select({ count: sql<number>`count(1)` }).from(_sql.as('sq')).then(res => res[0].count)

    if (total === 0) {
      return { data: [], total }
    }

    const res = await _sql
      .orderBy(
        ...[
          desc(eq(schema.beatmaps.title, keyword))?.if(keyword),
          desc(eq(schema.beatmaps.artist, keyword))?.if(keyword),
          desc(like(schema.beatmaps.title, `${keyword}%`))?.if(keyword),
          desc(like(schema.beatmaps.artist, `${keyword}%`))?.if(keyword),
          desc(schema.sources.id),
        ]
          .filter(TSFilter)
      )
      .limit(opt.perPage)
      .offset(opt.page * opt.perPage)

    return {
      data: res.map((bs) => {
        return {
          ...toBeatmapset(bs, bs.meta),
          maps: bs.beatmaps.map(m => ({
            id: m.id as Id,
            foreignId: m.server === 'osu!' ? m.id : undefined,
            md5: m.md5,
            version: m.version,
            source: toBeatmapSource(m.server),
            status: toRankingStatus(m.status),
          })),
        }
      }).filter(TSFilter),
      total,
    }
  }

  async update(map: Base.UpdateParam<Id, Id>): Promise<Base.VeryCompactBeatmap<Id, Id>> {
    await this.drizzle
      .update(schema.beatmaps)
      .set({
        status: map.status && Number.isInteger(map.status) ? fromRankingStatus(map.status) : undefined,
      })
      .where(eq(schema.beatmaps.id, map.id))

    return await this.drizzle.select({
      id: schema.beatmaps.id,
      version: schema.beatmaps.version,
      md5: schema.beatmaps.md5,
      status: schema.beatmaps.status,
    })
      .from(schema.beatmaps)
      .where(eq(schema.beatmaps.id, map.id))
      .then(res => this.toVeryCompatBeatmap(res[0]))
  }

  toVeryCompatBeatmap(bm: Pick<typeof schema.beatmaps.$inferSelect, 'id' | 'md5' | 'version' | 'status'>) {
    return {
      id: bm.id as Id,
      version: bm.version,
      md5: bm.md5,
      status: toRankingStatus(bm.status),
    }
  }

  async metrics(input: Base.MetricsParam): Promise<Base.Metrics> {
    const now = Date.now()
    const period = input.active === 'daily' ? 24 * 60 * 60 * 1000 : input.active === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000
    const since = new Date(now - period)
    const res = await this.drizzle.select({
      total: sql`count(*)`.mapWith(Number),
      new: sql`count(if(${schema.beatmaps.lastUpdate} > ${since}, 1, null))`.mapWith(Number),
      ranked: sql`count(if(${schema.beatmaps.status} = ${BanchoPyRankedStatus.Ranked}, 1, null))`.mapWith(Number),
      loved: sql`count(if(${schema.beatmaps.status} = ${BanchoPyRankedStatus.Loved}, 1, null))`.mapWith(Number),
    }).from(schema.beatmaps)
    return {
      count: {
        total: res[0].total,
        new: res[0].new,
        ranked: res[0].ranked,
        loved: res[0].loved,
      },
    }
  }
}
