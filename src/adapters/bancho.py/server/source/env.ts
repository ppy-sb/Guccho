import { intersection, literal, object, string, union } from 'zod'
import { ensureAndGetEnv } from '~/server'

export const database = literal('database')
export const memory = literal('memory')
export const redis = literal('redis')

const redisURL = string().url()
export const dsn = string().url()

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

export const env = ensureAndGetEnv(
  intersection(
    validateDB,
    intersection(
      validateLeaderboard,
      validateSessionStore
    )
  )
)
