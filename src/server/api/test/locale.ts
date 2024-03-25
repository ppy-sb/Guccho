import { object, record, string, unknown } from 'zod'
import { GucchoError } from '../../trpc/messages'

const vQ = object({
  key: string(),
  params: record(string(), unknown()).optional(),
})
export default defineEventHandler(async (event) => {
  try {
    const q = vQ.parse(await readBody(event))
    const t = await useTranslation(event)
    return t(q.key, q.params as any)
  }
  catch (e) {
    console.error(e)
    throwGucchoError(GucchoError.UnknownError)
  }
})
