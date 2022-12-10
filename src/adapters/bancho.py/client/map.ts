import type { PrismaClient } from '@prisma/client'
import { MapDataProvider } from '../../base/client/map'
import { toBeatmap, toBeatmapWithBeatmapset, toBeatmapset } from '../transforms/to-beatmapset'
import type { IdType } from './../config'
import { prismaClient } from '.'

export default class BanchoPyMap extends MapDataProvider<IdType> implements MapDataProvider<IdType> {
  db: PrismaClient

  constructor({ client }: { client: PrismaClient } = { client: prismaClient }) {
    super()
    this.db = client
  }

  async getBeatmap(query: { id: number }) {
    const { id } = query
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

  async getBeatmapset(query: { id: number }) {
    const { id } = query
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

    return Object.assign(beatmapset, { beatmaps: beatmaps.map(toBeatmap) })
  }
}
