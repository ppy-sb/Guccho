import { createClient } from 'redis'
import { fromZodError } from 'zod-validation-error'

import type { ZodError } from 'zod'
import { literal, object, string, union } from 'zod'

const envFalse = union([literal('false'), literal('False'), literal('0')]).transform(() => false as const)
const envTrue = union([literal('true'), literal('True'), literal('1')]).transform(() => true as const)
const envBool = union([envTrue, envFalse])

export const validator = union([
  object({
    USE_REDIS_LEADERBOARD: envBool,
    USE_REDIS_SESSION_STORE: envBool,
    BANCHO_PY_REDIS_URI: string(),
  }),
  object({
    USE_REDIS_LEADERBOARD: envFalse,
    USE_REDIS_SESSION_STORE: envFalse,
    BANCHO_PY_REDIS_URI: string().optional(),
  }),
])

// declare global {
//   namespace NodeJS {
//     interface ProcessEnv extends z.infer<typeof _z> {}
//   }
// }

export function ensureAndGetRedisEnv() {
  try {
    return validator.parse(process.env)
  }
  catch (e) {
    throw new Error(
      fromZodError(
        e as ZodError,
        {
          prefix: 'env validation error:\n',
          prefixSeparator: '',
          issueSeparator: ';\n',
          unionSeparator: ',\n',
        }
      ).message
    )
  }
}

export const env = ensureAndGetRedisEnv()
export function client() {
  if (!env) {
    return
  }
  if (!env.USE_REDIS_LEADERBOARD && !env.USE_REDIS_SESSION_STORE) {
    return
  }

  const client = createClient({
    url: env.BANCHO_PY_REDIS_URI,
  })
  client.on('error', err => console.error('Redis Client', err))
  client.connect()

  return client
}
