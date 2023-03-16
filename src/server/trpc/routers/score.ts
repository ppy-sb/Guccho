import { string, z } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { idToString, scoreIdToString, stringToScoreId } from '$active'
import { ScoreProvider } from '$active/server'
import { beatmapIsVisible } from '~/utils/map'

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

      return {
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
    }),
})
