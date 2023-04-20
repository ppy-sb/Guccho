import { string, z } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { mapId } from '../../transforms/mapId'
import { ScoreProvider } from '$active/server'
import { beatmapIsVisible } from '~/utils/map'

const s = new ScoreProvider()
export const router = _router({
  id: p
    .input(
      z.object({
        id: string(),
      })
    )
    .query(async ({ input }) => {
      const score = await s.id(s.stringToScoreId(input.id))

      return {
        ...score,
        id: s.scoreIdToString(score.id),
        beatmap: beatmapIsVisible(score.beatmap)
          ? {
              ...mapId(score.beatmap, s.idToString),
              beatmapset: mapId(score.beatmap.beatmapset, s.idToString),
            }
          : score.beatmap,
      }
    }),
})
