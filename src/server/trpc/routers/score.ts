import { string, z } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { idToString, scoreIdToString, stringToScoreId } from '$active/exports'
import { ScoreDataProvider } from '$active/client'
import { assertBeatmapIsVisible } from '~/utils/map'

const sScore = new ScoreDataProvider()
export const router = _router({
  id: p.input(z.object({
    id: string(),
  })).query(async ({ input }) => {
    const score = await sScore.id(stringToScoreId(input.id))

    if (!score)
      return null

    const returnValue = {
      ...score,
      id: scoreIdToString(score.id),
      beatmap: assertBeatmapIsVisible(score.beatmap)
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
