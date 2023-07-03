import type { ZodType, z } from 'zod'
import { ZodError, literal, object, string, union } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { zodFQDN, zodPath } from '~/server/trpc/shapes'
import { Logger } from '$base/log'

const logger = Logger.child({ label: 'env' })

export const database = literal('database')
export const memory = literal('memory')
export const redis = literal('redis')
export const header = literal('header')
export const api = literal('api')
export const bpy = literal('bancho.py')
export const sbAtBpy = literal('ppy.sb@bancho.py')

export const redisURL = string().url()
export const dsn = string().url()
export const literalTrue = string().transform(input => input.toLocaleLowerCase() === 'true')
export const literalFalse = string().transform(input => input.toLocaleLowerCase() === 'false')
export const literalBoolean = literalTrue.or(literalFalse)
export const BACKEND = union([bpy, sbAtBpy])

const validateSessionStore = union([
  object({ SESSION_STORE: memory }),
  object({ REDIS_URL: redisURL, SESSION_STORE: redis }),
])

const validateLeaderboard = union([
  object({ LEADERBOARD_SOURCE: database }),
  object({
    REDIS_URL: redisURL,
    LEADERBOARD_SOURCE: redis,
  }),
])

const validateDB = object({ DB_DSN: dsn })

const validateBase = object({
  BACKEND,
})

const validateAvatar = object({
  BANCHO_PY_AVATAR_LOCATION: zodPath,
  AVATAR_DOMAIN: zodFQDN,
})

const validateApi = object({
  BANCHO_PY_API_V1_ENDPOINT: string().url().optional(),
})

export const env = ensureAndGetEnv(
  validateBase
    .merge(validateDB)
    .merge(validateAvatar)
    .merge(validateApi)
    .and(validateLeaderboard)
    .and(validateSessionStore)
)

export function ensureEnv<Z extends ZodType>(zod: Z) {
  ensureAndGetEnv(zod)
}

export function ensureAndGetEnv<Z extends ZodType>(zod: Z): z.infer<Z> {
  try {
    return zod.parse(process.env)
  }
  catch (e) {
    if (!(e instanceof ZodError)) {
      logger.error(e)
      throw e
    }
    const formattedZodError = fromZodError(
      e,
      {
        prefix: 'env validation error:\n',
        prefixSeparator: '',
        issueSeparator: ';\n',
        unionSeparator: ',\n',
      }
    )
    logger.error(formattedZodError)
    throw new Error(
      formattedZodError.message
    )
  }
}
