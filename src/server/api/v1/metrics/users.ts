import { users } from '~/server/singleton/service'

export default defineEventHandler(async (_event) => {
  return await users.metrics()
})
