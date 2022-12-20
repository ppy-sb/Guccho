import { string, z } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { idToString, stringToId } from '~~/src/adapters/ppy.sb@bancho.py/config'
import { MapDataProvider } from '$active/client'

const map = new MapDataProvider()
export const router = _router({
  beatmapset: p.input(z.object({
    id: string(),
  })).query(async ({ input }) => {
    const bs = await map.getBeatmapset({ id: stringToId(input.id) })
    if (!bs)
      return
    return Object.assign(bs, { id: idToString(bs.id), beatmaps: bs.beatmaps.map(bm => Object.assign(bm, { id: idToString(bm.id) })) })
  }),
})
