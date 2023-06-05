import { string, z } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { mapId } from '~/server/transforms/mapId'
import { ScoreProvider } from '~/server/backend/bancho.py/server'

const s = new ScoreProvider()
export const router = _router({
  id: p
    .input(
      z.object({
        id: string().trim(),
      })
    )
    .query(async ({ input }) => {
      const score = await s.id(ScoreProvider.stringToScoreId(input.id))

      return {
        ...score,
        id: ScoreProvider.scoreIdToString(score.id),
        beatmap: beatmapIsVisible(score.beatmap)
          ? {
              ...mapId(score.beatmap, ScoreProvider.idToString),
              beatmapset: mapId(score.beatmap.beatmapset, ScoreProvider.idToString),
            }
          : score.beatmap,
      }
    }),
})
