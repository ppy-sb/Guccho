import { and, count, desc, eq, inArray, like, or, sql, sum } from 'drizzle-orm'
import * as operators from 'drizzle-orm'
import { type MySql2Database } from 'drizzle-orm/mysql2'
import type { Id } from '..'
import {
  idToString,
  stringToId,
  toBeatmapCompact,
  toBeatmapSource,
  toBeatmapWithBeatmapset, toBeatmapset, toRankingStatus,
} from '../transforms'
import * as schema from '../drizzle/schema'
import { BanchoPyRankedStatus } from '../enums'
import { useDrizzle } from './source/drizzle'
import { toBanchoMode } from '~/server/backend/bancho.py/transforms'
import type { Tag } from '~/def/search'
import { type AbnormalStatus, type Beatmapset, RankingStatus } from '~/def/beatmap'
import type { MapProvider as Base } from '$base/server'

const drizzle = useDrizzle(schema)

export class MapProvider implements Base<Id, Id> {
  static readonly idToString = idToString
  static readonly stringToId = stringToId

  drizzle = drizzle

  async getBeatmap(query: string) {
    const queryAsId = stringToId(query)

    const beatmap = await this.drizzle.query.beatmaps.findFirst({
      where: or(
        eq(schema.beatmaps.md5, query),
        Number.isNaN(queryAsId) ? undefined : eq(schema.beatmaps.id, queryAsId),
      ),
      with: {
        source: true,
      },
    }) ?? raise(Error, 'beatmap not found') satisfies typeof schema.beatmaps.$inferSelect & {
      source: typeof schema.sources.$inferSelect
    }

    return toBeatmapWithBeatmapset(beatmap, beatmap.source)
  }

  async getBeatmapset(query: { id: Id }, user?: { id: Id }) {
    const { id } = query

    const source = await this.drizzle.query.sources.findFirst({
      where: eq(schema.sources.id, id),
      with: {
        beatmaps: {
          orderBy: (fields, operators) => [
            operators.asc(fields.diff),
            operators.asc(fields.id),
          ],

        },
      },
    }) ?? raise(Error, 'beatmap not found')

    const countRequests = await this.drizzle.select({
      mapId: schema.mapRequests.mapId,
      count: count(schema.mapRequests.id),
      voted: (
        user
          ? sum(eq(schema.mapRequests.playerId, user.id)).mapWith(Number)
          : sql.raw('0')
      ).as('voted'),
    }).from(schema.mapRequests)
      .innerJoin(schema.beatmaps, and(
        eq(schema.beatmaps.id, schema.mapRequests.mapId),
      ))
      .groupBy(schema.mapRequests.mapId)
      .where(and(
        eq(schema.beatmaps.setId, id),
        eq(schema.mapRequests.active, sql.raw('1')),
      ))

    const beatmapset = toBeatmapset(source, source.beatmaps[0])

    return Object.assign(beatmapset, {
      beatmaps: source.beatmaps.map((bm) => {
        const statusOk = bm.status === BanchoPyRankedStatus.Pending || bm.status === BanchoPyRankedStatus.Loved || bm.status === BanchoPyRankedStatus.Qualified
        const r = countRequests.find(r => r.mapId === bm.id) ?? { count: 0, voted: false }
        return {
          ...toBeatmapCompact(bm, toBeatmapSource(source.server)),
          status: toRankingStatus(bm.status, bm.lastUpdate) ?? RankingStatus.NotFound,
          request: user?.id
            ? {
                status: user?.id ? statusOk ? (r.voted ? 'voted' : 'allowed') : undefined : undefined,
                voteCount: r.count,
              }
            : undefined,
        }
      }) as Base.BeatmapsetWithMaps<Id, Id>['beatmaps'],
    }) as Base.BeatmapsetWithMaps<Id, Id>
  }

  async getMapRankRequest(id: Id, user?: { id: Id }, tx: MySql2Database<typeof schema> = this.drizzle) {
    const [countRequests] = await tx.select({
      count: count(schema.mapRequests.id),
      voted: (
        user
          ? sum(eq(schema.mapRequests.playerId, user.id)).mapWith(Number)
          : sql.raw('0')
      ).as('voted'),
    }).from(schema.mapRequests)
      .innerJoin(schema.beatmaps, and(
        eq(schema.beatmaps.id, schema.mapRequests.mapId),
      ))
      .where(and(
        inArray(schema.beatmaps.status, [BanchoPyRankedStatus.Pending, BanchoPyRankedStatus.Loved, BanchoPyRankedStatus.Qualified]),
        eq(schema.beatmaps.id, id),
        eq(schema.mapRequests.active, sql.raw('1')),
      ))

    return countRequests && user?.id !== undefined
      ? {
          status: countRequests.voted ? 'voted' : 'allowed',
          voteCount: countRequests.count,
        } as const
      : undefined
  }

  async voteMap(id: Id, user: { id: Id }): Promise<Base.BeatmapRequest | undefined> {
    return await this.drizzle.transaction(async (tx) => {
      const [_delete] = await tx.delete(schema.mapRequests)
        .where(and(
          eq(schema.mapRequests.playerId, user.id),
          eq(schema.mapRequests.mapId, id),
        ))

      if (_delete.affectedRows === 0) {
        await tx.insert(schema.mapRequests)
          .values({
            playerId: user.id,
            mapId: id,
            active: true,
            datetime: new Date(),
          })
          .onDuplicateKeyUpdate({
            set: {
              active: true,
              datetime: new Date(),
            },
          })
      }

      return this.getMapRankRequest(id, user, tx)
    })
  }

  private MAP = {
    bpm: 'bpm',
    starRating: 'diff',
    accuracy: 'od',
    circleSize: 'cs',
    approachRate: 'ar',
    hpDrain: 'hp',
    length: 'totalLength',
  } as const satisfies Record<Exclude<Tag[0], 'mode'>, keyof typeof schema.beatmaps>

  createFiltersFromTags(fields: Pick<typeof schema.beatmaps, typeof this.MAP [keyof typeof this.MAP] | 'mode'>, filters: Tag[] = []) {
    const ops: operators.SQL[] = []
    for (const tag of filters ?? []) {
      const [type, op, val] = tag
      const operator = operators[op]
      if (type === 'mode') {
        ops.push(operator(fields.mode, toBanchoMode(val)))
      }
      else {
        const fieldKey = this.MAP[type]
        const field = fields[fieldKey]
        ops.push(operator(field, val))
      }
    }
    return ops
  }

  async searchBeatmap(opt: { keyword: string; limit: number; filters?: Tag[] }) {
    const { keyword, limit, filters } = opt
    const idKw = stringToId(keyword)

    const sql = this.drizzle.query.beatmaps.findMany({

      where: (fields) => {
        return and(
          or(
            like(fields.version, `%${keyword}%`),
            Number.isNaN(idKw) ? undefined : eq(fields.setId, idKw),
          ),
          ...this.createFiltersFromTags(fields, filters)
        )
      },
      with: {
        source: true,
      },

      orderBy: [
        desc(eq(schema.beatmaps.version, keyword)),
        desc(like(schema.beatmaps.version, `${keyword}%`)),
        desc(eq(schema.beatmaps.title, keyword)),
        desc(like(schema.beatmaps.title, `${keyword}%`)),
        desc(eq(schema.beatmaps.artist, keyword)),
        desc(like(schema.beatmaps.artist, `${keyword}%`)),
        desc(schema.beatmaps.setId),
      ],
      limit,
    })

    const result = (await sql)
      .map(i => toBeatmapWithBeatmapset(i, i.source))
      .filter(
        (item): item is typeof item & { status: Exclude<RankingStatus, AbnormalStatus> } =>
          item.status !== RankingStatus.NotFound && item.status !== RankingStatus.Deleted
      )
    return result
  }

  async searchBeatmapset({
    keyword,
    limit,
    filters,
  }: {
    keyword: string
    limit: number
    filters?: Tag[]
  }): Promise<Beatmapset<Id, Id>[]> {
    const idKw = stringToId(keyword)
    const sql = this.drizzle.select({
      id: schema.sources.id,
      server: schema.sources.server,
      meta: {
        title: schema.beatmaps.title,
        artist: schema.beatmaps.artist,
      },
    })
      .from(schema.sources)
      .innerJoin(schema.beatmaps, and(
        eq(schema.beatmaps.setId, schema.sources.id),
        eq(schema.beatmaps.server, schema.sources.server),
      ))
      .where(and(
        or(
          like(schema.beatmaps.version, `%${keyword}%`),
          like(schema.beatmaps.title, `%${keyword}%`),
          like(schema.beatmaps.artist, `%${keyword}%`),
          like(schema.beatmaps.creator, `%${keyword}%`),
          Number.isNaN(idKw) ? undefined : eq(schema.beatmaps.setId, idKw),
        ),
        ...this.createFiltersFromTags(schema.beatmaps, filters)
      ))
      .groupBy(schema.sources.id, schema.sources.server, schema.beatmaps.title, schema.beatmaps.artist)
      .orderBy(
        desc(eq(schema.beatmaps.title, keyword)),
        desc(eq(schema.beatmaps.artist, keyword)),
        desc(like(schema.beatmaps.title, `${keyword}%`)),
        desc(like(schema.beatmaps.artist, `${keyword}%`)),
        desc(schema.sources.id)
      )
      .limit(limit)

    return (await sql).map(bs => toBeatmapset(bs, bs.meta)).filter(TSFilter)
  }
}
