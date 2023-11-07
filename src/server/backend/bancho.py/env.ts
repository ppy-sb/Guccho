import type { Prisma } from 'prisma-client-bancho-py'
import { array, discriminatedUnion, literal, object, string } from 'zod'
import { zodFQDN as FQDN, zodPath as path } from '~/server/trpc/shapes'
import { validator as base, redis, redisURL } from '$base/env'
import guccho from '~~/guccho.config'

const { backend: env } = guccho

export const database = literal('database')
export const header = literal('header')
export const api = literal('api')
export const dsn = string().url()
export const rank = discriminatedUnion('leaderboardSource', [
  object({
    leaderboardSource: database,
  }),
  object({
    leaderboardSource: redis,
    redisURL,
  }),
])

export const avatar = object({
  location: path,
  domain: FQDN,
})

export const apiEndpoint = object({
  v1: string().url().optional(),
}).optional()

export const log = object({
  prisma: array(literal('info').or(literal('query')).or(literal('warn')).or(literal('error'))).refine((arg): arg is Prisma.LogLevel[] => true),
}).partial().optional()

export const validator = base.and(object({
  dsn,
  avatar,
  api: apiEndpoint,
  log,
}).and(rank))

export const config = lazySingleton(() => validator.parse(env))
