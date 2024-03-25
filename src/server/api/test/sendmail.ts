import { object, string } from 'zod'
import { assertHaveSession } from '../../middleware/0.session'
import { assertLoggedIn } from '../../middleware/1.user'
import { assertIsAdmin } from '../../middleware/2.admin'
import { mail } from '../../singleton/service'
import { GucchoError } from '../../trpc/messages'

const vQ = object({
  to: string().email(),
  subject: string().default('no subject'),
  content: string().default('no content'),
})
export default defineEventHandler(async (event) => {
  try {
    assertHaveSession(event)
    assertLoggedIn(event)
    assertIsAdmin(event)
    const q = getQuery(event)
    const parsed = vQ.parse(q)
    const t = await useTranslation(event)
    return mail.send({ ...parsed, content: t(parsed.content) })
  }
  catch (e) {
    throwGucchoError(GucchoError.RequireAdminPrivilege)
  }
})
