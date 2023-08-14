import { discriminatedUnion, literal, object, string } from 'zod'
import { zodFQDN, zodPath } from '~/server/trpc/shapes'
import { validator as base, redis, redisURL } from '$base/env'
import env from '~~/env'

export const database = literal('database')
export const header = literal('header')
export const api = literal('api')
export const dsn = string().url()
export const leaderboard = discriminatedUnion('leaderboardSource', [
  object({
    leaderboardSource: database,
  }),
  object({
    leaderboardSource: redis,
    redisURL,
  }),
])

export const avatar = object({
  location: zodPath,
  domain: zodFQDN,
})

export const apiEndpoint = object({
  v1: string().url().optional(),
}).optional()

export const validator = base.and(object({
  dsn,
  avatar,
  api: apiEndpoint,
}).and(leaderboard))

export const config = lazySingleton(() => validator.parse(env))
