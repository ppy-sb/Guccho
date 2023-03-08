import type { PrismaClient } from '.prisma/bancho.py'
import { stringToId, toBeatmapEssential, toBeatmapWithBeatmapset, toBeatmapset, toRankingStatus } from '../transforms'

import type { Id } from '../exports'
import { prismaClient } from '.'
import type { MapDataProvider } from '$def/client/map'
import type { BeatmapSource, Beatmapset } from '~/types/beatmap'
import { TSFilter } from '~/utils'

export default class BanchoPyMap implements MapDataProvider<Id> {
  db: PrismaClient

  constructor() {
    this.db = prismaClient
  }

  async getBeatmap(query: { id: Id }) {
    const { id } = query
    if (!id) {
      return null
    }
    const beatmap = await this.db.map.findFirst({
      where: {
        id,
      },
      include: {
        source: true,
      },
    })
    if (!beatmap) {
      return null
    }
    return toBeatmapWithBeatmapset(beatmap) || null
  }

  async getBeatmapset(query: { id: Id }) {
    const { id } = query
    if (!id) {
      return null
    }
    const source = await this.db.source.findFirst({
      where: {
        id,
      },
    })
    if (!source) {
      return null
    }
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
    if (!beatmaps.length) {
      return null
    }
    const beatmapset = toBeatmapset(source, beatmaps[0])
    if (!beatmapset) {
      return null
    }

    return Object.assign(beatmapset, {
      beatmaps: beatmaps.map(bm => ({
        ...toBeatmapEssential(bm),
        status: toRankingStatus(bm.status) || 'notFound',
      })),
    })
  }

  async searchBeatmap({ keyword, limit }: { keyword: string; limit: number }) {
    const idKw = stringToId(keyword)
    const result = await this.db.map.findMany({
      take: limit,
      where: {
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
  }: {
    keyword: string
    limit: number
  }): Promise<Beatmapset<BeatmapSource, number, unknown>[]> {
    const idKw = stringToId(keyword)
    const beatmaps = await this.db.map.findMany({
      take: limit,
      where: {
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
