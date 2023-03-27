import {
  createFilter,
  idToString,

  stringToId,
  toBeatmapEssential,
  toBeatmapWithBeatmapset, toBeatmapset, toRankingStatus,
} from '../transforms'
import type { Id } from '..'
import { getPrismaClient } from './prisma'
import type { Tag } from '~/types/search'

import { TSFilter } from '~/utils'
import type { MapProvider as Base } from '~/adapters/base/server'
import type { BeatmapSource, Beatmapset } from '~/types/beatmap'
export class MapProvider implements Base<Id> {
  idToString = idToString
  stringToId = stringToId
  db = getPrismaClient()

  async getBeatmap(query: { id: Id }) {
    const { id } = query
    const beatmap = await this.db.map.findFirstOrThrow({
      where: {
        id,
      },
      include: {
        source: true,
      },
    })
    return toBeatmapWithBeatmapset(beatmap)
  }

  async getBeatmapset(query: { id: Id }) {
    const { id } = query
    const source = await this.db.source.findFirstOrThrow({
      where: {
        id,
      },
    })
    // if (!source) {
    //   throw new TRPCError({
    //     message: `unable to find beatmap source: ${id}`,
    //     code: 'NOT_FOUND',
    //   })
    // }
    const beatmaps = await this.db.map.findMany({
      where: {
        source: {
          id,
        },
      },
      orderBy: {
        diff: 'asc',
      },
    })
    const beatmapset = toBeatmapset(source, beatmaps[0])

    return Object.assign(beatmapset, {
      beatmaps: beatmaps.map(bm => ({
        ...toBeatmapEssential(bm),
        status: toRankingStatus(bm.status) || 'notFound',
      })),
    })
  }

  async searchBeatmap(opt: { keyword: string; limit: number; filters?: Tag[] }) {
    const { keyword, limit, filters } = opt
    const idKw = stringToId(keyword)
    const result = await this.db.map.findMany({
      take: limit,
      where: {
        AND: [
          {
            OR: [
              isNaN(idKw)
                ? undefined
                : {
                    setId: idKw,
                  },
              {
                version: {
                  contains: keyword,
                },
              },
            ].filter(TSFilter),
          },
          ...(filters ? createFilter(filters) : []),
        ],
      },
      include: {
        source: true,
      },
      orderBy: [
        {
          setId: 'desc',
        },
      ],
    })
    return result.map(toBeatmapWithBeatmapset).filter(TSFilter)
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
    const beatmaps = await this.db.map.findMany({
      take: limit,
      where: {
        AND: [
          {
            OR: [
              isNaN(idKw)
                ? undefined
                : {
                    setId: idKw,
                  },
              {
                title: {
                  contains: keyword,
                },
              },
              {
                artist: {
                  contains: keyword,
                },
              },
              {
                creator: {
                  contains: keyword,
                },
              },
            ].filter(TSFilter),
          },
          ...(filters ? createFilter(filters) : []),
        ],
      },
      distinct: ['setId'],
      orderBy: [
        {
          setId: 'desc',
        },
      ],
      include: {
        source: true,
      },
    })
    return beatmaps.map(bs => toBeatmapset(bs.source, bs)).filter(TSFilter)
  }

  // async search(opt: { keyword: string; limit: number }) {
  //   const [beatmaps, beatmapsets] = await Promise.all([this.searchBeatmap(opt), this.searchBeatmapset(opt)])
  //   return {
  //     beatmaps,
  //     beatmapsets,
  //   }
  // }
}
