import { maps } from '~/server/singleton/service'

export default defineEventHandler(async (_event) => {
  return await maps.metrics()
})
