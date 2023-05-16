import { ZodSchema, ZodTypeDef, array, date, literal, number, object, string, tuple, union } from 'zod'
import { ArticleProvider } from '../../..'
import { zodTipTapJSONContent } from '../../../../../../trpc/shapes'

export const v = 1
export const writeAccess = union([
  literal('staff'),
  literal('moderator'),
  literal('beatmapNominator'),
])
export const readAccess = writeAccess.or(literal('public'))

export const defaultPrivilege = {
  read: ['public' as const],
  write: ['staff' as const],
}
export const ownerId = union([string(), number()])

export const schema: ZodSchema<ArticleProvider.Content & ArticleProvider.Meta, ZodTypeDef, unknown> = object({
  json: zodTipTapJSONContent,
  v: literal(v),
  privilege: object({
    read: array(readAccess),
    write: array(writeAccess),
  }).default(defaultPrivilege),
  owner: ownerId,
  created: tuple([ownerId, date()]),
  lastUpdated: tuple([ownerId, date()]),
}).and(union([
  object({
    html: string(),
    dynamic: literal(false),
  }),
  object({
    dynamic: literal(true),
  }),
]))
