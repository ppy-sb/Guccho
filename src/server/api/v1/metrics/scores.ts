import { scores } from '~/server/singleton/service'

export default defineEventHandler(async (_event) => {
  return await scores.metrics()
})
