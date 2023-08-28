import { ScoreProvider } from '$active/server'
import { assertHaveSession } from '~/server/middleware/0.session'
import { scores } from '~/server/singleton/service'

export default defineEventHandler(async (event) => {
  try {
    assertHaveSession(event)
    let scoreId = event.context.params?.id
    scoreId = scoreId ?? raise(Error, 'required id')
    await scores.downloadReplay(ScoreProvider.stringToScoreId(scoreId), event)
  }
  catch (e) {
    // await sendRedirect(event, '/404')
    return sendError(event, e as Error)
  }
})
