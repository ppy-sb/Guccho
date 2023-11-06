import { ScoreProvider, files } from '~/server/singleton/service'
import { haveSession } from '~/server/middleware/0.session'

export default defineEventHandler(async (event) => {
  haveSession(event) || throwError(createError({
    statusCode: 400,
    statusMessage: 'Require session.',
  }))
  try {
    let scoreId = event.context.params?.id
    scoreId = scoreId ?? raise(Error, 'required id')
    await files.replay(ScoreProvider.stringToScoreId(scoreId), event)
  }
  catch (e) {
    // await sendRedirect(event, '/404')
    throw createError({
      stack: (e as Error).stack,
      statusCode: 400,
      statusMessage: 'Replay not found.',
    })
  }
})
