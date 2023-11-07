import { resolve } from 'node:path'
import { discriminatedUnion, literal, object, string } from 'zod'
import { zodPath } from '~/server/trpc/shapes'
import guccho from '~~/guccho.config'

const { backend: env } = guccho

export const redisURL = string().url()
export const memory = literal('memory')
export const redis = literal('redis')

export const validator = discriminatedUnion('sessionStore', [
  object({ sessionStore: memory }),
  object({ redisURL, sessionStore: redis }),
]).and(object({
  article: object({
    location: zodPath.default(resolve('articles')),
  }),
}))

export const config = lazySingleton(() => validator.parse(env))
