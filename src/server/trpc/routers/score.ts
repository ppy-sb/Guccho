import { object, string } from 'zod'
import { router as _router, publicProcedure as p } from '../trpc'
import { ScoreProvider, scores } from '~/server/singleton/service'

export const router = _router({
  id: p
    .input(
      object({
        id: string().trim(),
      }),
    )
    .query(async ({ input }) => {
      const score = await scores.id(ScoreProvider.stringToScoreId(input.id))

      return Object.assign(score, {
        id: ScoreProvider.scoreIdToString(score.id),
        beatmap: beatmapIsVisible(score.beatmap)
          ? {
              ...mapId(score.beatmap, ScoreProvider.idToString),
              beatmapset: mapId(score.beatmap.beatmapset, ScoreProvider.idToString),
            }
          : score.beatmap,
      })
    }),
})
