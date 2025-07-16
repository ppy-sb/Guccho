import { uneval } from 'devalue'
import { assertHaveSession } from '~/server/middleware/0.session'
import { assertLoggedIn } from '~/server/middleware/1.user'
import { assertIsAdmin } from '~/server/middleware/2.admin'
import { DanProvider, dans } from '~/server/singleton/service'
import { GucchoError } from '~/def/messages'

export default defineEventHandler(async (event) => {
  try {
    assertHaveSession(event)
    assertLoggedIn(event)
    assertIsAdmin(event)

    const data = await dans.exportAll()

    // user download data
    event.node.res.setHeader('Content-Type', 'application/js')
    event.node.res.setHeader('Content-Disposition', `attachment; filename="dans-${new Date().getTime()}.js"`)

    return uneval(data.map(i => mapId(i, DanProvider.idToString)))
  }
  catch (e) {
    throwGucchoError(GucchoError.RequireAdminPrivilege)
  }
})
