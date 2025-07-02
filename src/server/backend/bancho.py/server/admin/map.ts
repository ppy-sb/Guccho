import { and, count, desc, eq, gt, like, or, sql } from 'drizzle-orm'
import { match, unit } from 'switch-pattern'
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
    opt.requested = false
    const votes = this.drizzle.$with('votes')
      .as(
        this.drizzle.select({
          mapId: schema.mapRequests.mapId,
          vote: count().as('vote'),
        })
          .from(schema.mapRequests)
          .where(
            eq(schema.mapRequests.active, true),
          )
          .groupBy(schema.mapRequests.mapId)
      )

    const { keyword } = opt
    const idKw = stringToId(keyword)
    const _sql = this.drizzle
      .with(votes)
      .select({
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
          lastUpdate: number
          vote: number | null
        }[]>`JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', ${schema.beatmaps.id},
          'md5', ${schema.beatmaps.md5},
          'version', ${schema.beatmaps.version},
          'server', ${schema.beatmaps.server},
          'status', ${schema.beatmaps.status},
          'lastUpdate', unix_timestamp(${schema.beatmaps.lastUpdate}),
          'vote', ${votes.vote}
        )
      )`,
      })
      .from(schema.sources)
      .innerJoin(schema.beatmaps, and(
        eq(schema.beatmaps.setId, schema.sources.id),
        eq(schema.beatmaps.server, schema.sources.server),
      ))
      .leftJoin(votes, eq(votes.mapId, schema.beatmaps.id))
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
          gt(votes.vote, 0).if(opt.requested || keyword === ''),
        )
      )
      .orderBy(
        ...[
          desc(schema.beatmaps.setId),
          desc(sql`max(${votes.vote})`).if(opt.requested || keyword === ''),
        ].filter(TSFilter),
      )
      .groupBy(schema.sources.id, schema.sources.server, schema.beatmaps.title, schema.beatmaps.artist, votes.vote)

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
          desc(votes.vote).if(opt.requested || keyword === ''),
        ]
          .filter(TSFilter),
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
            status: toRankingStatus(m.status, new Date(m.lastUpdate * 1000)),
            vote: m.vote ?? undefined,
          })),
        }
      }).filter(TSFilter),
      total,
    }
  }

  async update(map: Base.UpdateParam<Id, Id>): Promise<Base.VeryCompactBeatmap<Id, Id>> {
    const old = (await this.drizzle.select({ status: schema.beatmaps.status, lastUpdate: schema.beatmaps.lastUpdate }).from(schema.beatmaps).where(eq(schema.beatmaps.id, map.id))).at(0)
    const newStatus = map.status !== undefined && Number.isInteger(map.status) ? fromRankingStatus(map.status) : undefined
    const oldStatus = old?.status as BanchoPyRankedStatus | undefined

    const update: Partial<typeof schema.beatmaps.$inferSelect> = {
    }

    let shouldClearRequests = false
    if (oldStatus !== newStatus) {
      const { patterns, exact } = match([oldStatus, newStatus] as const)

      switch (patterns) {
        case (exact([unit, BanchoPyRankedStatus.Loved])):
        case (exact([BanchoPyRankedStatus.Loved, BanchoPyRankedStatus.Qualified])):
        case (exact([BanchoPyRankedStatus.Qualified, BanchoPyRankedStatus.Ranked])):
        {
          update.status = newStatus
          shouldClearRequests = true
          break
        }
        case (exact([BanchoPyRankedStatus.Qualified, BanchoPyRankedStatus.Approved])):
        case (exact([BanchoPyRankedStatus.Qualified, BanchoPyRankedStatus.Loved])):
        case (exact([BanchoPyRankedStatus.Ranked, BanchoPyRankedStatus.Pending])):
        case (exact([BanchoPyRankedStatus.Approved, BanchoPyRankedStatus.Pending])):
        case (exact([BanchoPyRankedStatus.Qualified, BanchoPyRankedStatus.Pending])):
        case (exact([BanchoPyRankedStatus.Loved, BanchoPyRankedStatus.Pending])):
        case (exact([BanchoPyRankedStatus.Ranked, BanchoPyRankedStatus.Qualified])):
        case (exact([BanchoPyRankedStatus.Approved, BanchoPyRankedStatus.Qualified])):
        case (exact([BanchoPyRankedStatus.Pending, BanchoPyRankedStatus.Qualified])):
        {
          update.status = newStatus
          break
        }
      }
    }

    if (Object.keys(map).length) {
      update.frozen = true
    }

    await this.drizzle
      .update(schema.beatmaps)
      .set(update)
      .where(eq(schema.beatmaps.id, map.id))

    if (shouldClearRequests) {
      await this.drizzle
        .update(schema.mapRequests)
        .set({ active: false })
        .where(eq(schema.mapRequests.mapId, map.id))
    }

    return await this.drizzle.select({
      id: schema.beatmaps.id,
      version: schema.beatmaps.version,
      md5: schema.beatmaps.md5,
      status: schema.beatmaps.status,
      lastUpdate: schema.beatmaps.lastUpdate,
    })
      .from(schema.beatmaps)
      .where(eq(schema.beatmaps.id, map.id))
      .then(res => this.toVeryCompatBeatmap(res[0]))
  }

  toVeryCompatBeatmap(bm: Pick<typeof schema.beatmaps.$inferSelect, 'id' | 'md5' | 'version' | 'status' | 'lastUpdate'>) {
    return {
      id: bm.id as Id,
      version: bm.version,
      md5: bm.md5,
      status: toRankingStatus(bm.status, bm.lastUpdate),
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
