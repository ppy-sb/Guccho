import { idToString, scoreIdToString, stringToScoreId } from '$active'
import { string, z } from 'zod'
import { ScoreProvider } from '~/adapters/ppy.sb@bancho.py/server'
import { beatmapIsVisible } from '~/utils/map'

import { publicProcedure as p, router as _router } from '../trpc'

const sScore = new ScoreProvider()
export const router = _router({
  id: p
    .input(
      z.object({
        id: string(),
      }),
    )
    .query(async ({ input }) => {
      const score = await sScore.id(stringToScoreId(input.id))

      if (!score) {
        return null
      }

      const returnValue = {
        ...score,
        id: scoreIdToString(score.id),
        beatmap: beatmapIsVisible(score.beatmap)
          ? {
              ...score.beatmap,
              id: idToString(score.beatmap.id),
              beatmapset: {
                ...score.beatmap.beatmapset,
                id: idToString(score.beatmap.beatmapset.id),
              },
            }
          : score.beatmap,
      }
      return returnValue
    }),
})
