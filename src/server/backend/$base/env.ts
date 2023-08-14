import { discriminatedUnion, literal, object, string } from 'zod'
import env from '~~/env'

export const redisURL = string().url()
export const memory = literal('memory')
export const redis = literal('redis')

export const validator = discriminatedUnion('sessionStore', [
  object({ sessionStore: memory }),
  object({ redisURL, sessionStore: redis }),
]).and(object({
  article: object({
    location: string().default('articles'),
  }),
}))

export const config = lazySingleton(() => validator.parse(env))
