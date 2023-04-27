import { createClient } from 'redis'

import * as z from 'zod'

const _z = z.object({
  BANCHO_PY_REDIS_URI: z.string().optional(),
})

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof _z> {}
  }
}

const checked = _z.parse(process.env)

export function client() {
  const client
    = checked.BANCHO_PY_REDIS_URI
      ? createClient({
        url: checked.BANCHO_PY_REDIS_URI,
      })
      : undefined
  if (client) {
    client.on('error', err => console.error('Redis Client', err))
    client.connect()
  }
  return client
}
