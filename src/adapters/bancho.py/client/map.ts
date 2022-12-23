import { toBeatmapEssential, toBeatmapWithBeatmapset, toBeatmapset } from '../transforms/to-beatmapset'
import { toRankingStatus } from '../transforms'
import type { Id } from './../config'
import { prismaClient } from '.'
import type { PrismaClient } from '@prisma/client'
import type { MapDataProvider } from '$def/client/map'

export default class BanchoPyMap implements MapDataProvider<Id> {
  db: PrismaClient

  constructor({ client }: { client: PrismaClient } = { client: prismaClient }) {
    this.db = client
  }

  async getBeatmap(query: { id: Id }) {
    const { id } = query
    if (!id)
      return null
    const beatmap = await this.db.map.findFirst({
      where: {
        id,
      },
      include: {
        source: true,
      },
    })
    if (!beatmap)
      return null
    return toBeatmapWithBeatmapset(beatmap) || null
  }

  async getBeatmapset(query: { id: Id }) {
    const { id } = query
    if (!id)
      return null
    const source = await this.db.source.findFirst({
      where: {
        id,
      },
    })
    if (!source)
      return null
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
    if (!beatmaps.length)
      return null
    const beatmapset = toBeatmapset(source, beatmaps[0])
    if (!beatmapset)
      return null

    return Object.assign(beatmapset, {
      beatmaps: beatmaps.map(bm => ({
        ...toBeatmapEssential(bm),
        status: toRankingStatus(bm.status) || 'notFound',
      })),
    })
  }
}
