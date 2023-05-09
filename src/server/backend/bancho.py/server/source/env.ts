import { literal, object, string, union } from 'zod'
import { zodFQDN, zodPath } from '~/server/trpc/shapes'
import { ensureAndGetEnv } from '~/server'

export const database = literal('database')
export const memory = literal('memory')
export const redis = literal('redis')
export const header = literal('header')
export const api = literal('api')
export const bpy = literal('bancho.py')
export const sbAtBpy = literal('ppy.sb@bancho.py')

export const redisURL = string().url()
export const dsn = string().url()

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
