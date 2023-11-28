import type {
  Map as DBMap,
  Source,
} from 'prisma-client-bancho-py'
import { and, desc, eq, like, or } from 'drizzle-orm'
import * as operators from 'drizzle-orm'
import type { Id } from '..'
import {
  idToString,
  stringToId,
  toBeatmapCompact,
  toBeatmapWithBeatmapset, toBeatmapset, toRankingStatus,
} from '../transforms'
import * as schema from '../drizzle/schema'
import useDrizzle from './source/drizzle'
import { toBanchoMode } from '~/server/backend/bancho.py/transforms'
import type { Tag } from '~/def/search'
import { type BeatmapSource, type Beatmapset, RankingStatus } from '~/def/beatmap'
import type { MapProvider as Base } from '$base/server'

const drizzle = await useDrizzle(schema)

export class MapProvider implements Base<Id> {
  static idToString = idToString
  static stringToId = stringToId

  drizzle = drizzle

  async getBeatmap(query: string) {
    const queryAsId = stringToId(query)

    const beatmap = await this.drizzle.query.maps.findFirst({
      where: or(
        eq(schema.maps.md5, query),
        Number.isNaN(queryAsId) ? undefined : eq(schema.maps.setId, queryAsId),
      ),
      with: {
        source: true,
      },
    }) ?? raise(Error, 'beatmap not found') satisfies DBMap & {
      source: Source
    }

    return toBeatmapWithBeatmapset(beatmap)
  }

  async getBeatmapset(query: { id: Id }) {
    const { id } = query

    const source = await this.drizzle.query.sources.findFirst({
      where: eq(schema.sources.id, id),
      with: {
        beatmaps: true,
      },
    }) ?? raise(Error, 'beatmap not found')

    const beatmapset = toBeatmapset(source, source.beatmaps[0])

    return Object.assign(beatmapset, {
      beatmaps: source.beatmaps.map(bm => ({
        ...toBeatmapCompact(bm),
        status: toRankingStatus(bm.status) || RankingStatus.NotFound,
      })),
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
  } as const satisfies Record<Exclude<Tag[0], 'mode'>, keyof typeof schema['maps']>

  createFiltersFromTags(fields: Pick<typeof schema['maps'], typeof this.MAP [keyof typeof this.MAP] | 'mode'>, filters: Tag[] = []) {
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

    const sql = this.drizzle.query.maps.findMany({

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
        desc(eq(schema.maps.version, keyword)),
        desc(like(schema.maps.version, `${keyword}%`)),
        desc(eq(schema.maps.title, keyword)),
        desc(like(schema.maps.title, `${keyword}%`)),
        desc(eq(schema.maps.artist, keyword)),
        desc(like(schema.maps.artist, `${keyword}%`)),
        desc(schema.maps.setId),
      ],
      limit,
    })

    return (await sql).map(toBeatmapWithBeatmapset).filter(TSFilter)
  }

  async searchBeatmapset({
    keyword,
    limit,
    filters,
  }: {
    keyword: string
    limit: number
    filters?: Tag[]
  }): Promise<Beatmapset<BeatmapSource, number, unknown>[]> {
    const idKw = stringToId(keyword)
    const sql = this.drizzle.select({
      id: schema.sources.id,
      server: schema.sources.server,
      meta: {
        title: schema.maps.title,
        artist: schema.maps.artist,
      },
    })
      .from(schema.sources)
      .innerJoin(schema.maps, and(
        eq(schema.maps.setId, schema.sources.id),
        eq(schema.maps.server, schema.sources.server),
      ))
      .where(and(
        or(
          like(schema.maps.version, `%${keyword}%`),
          like(schema.maps.title, `%${keyword}%`),
          like(schema.maps.artist, `%${keyword}%`),
          like(schema.maps.creator, `%${keyword}%`),
          Number.isNaN(idKw) ? undefined : eq(schema.maps.setId, idKw),
        ),
        ...this.createFiltersFromTags(schema.maps, filters)
      ))
      .groupBy(schema.sources.id, schema.sources.server, schema.maps.title, schema.maps.artist)
      .orderBy(
        desc(eq(schema.maps.title, keyword)),
        desc(eq(schema.maps.artist, keyword)),
        desc(like(schema.maps.title, `${keyword}%`)),
        desc(like(schema.maps.artist, `${keyword}%`)),
        desc(schema.sources.id)
      )
      .limit(limit)

    return (await sql).map(bs => toBeatmapset(bs, bs.meta)).filter(TSFilter)
  }
}
