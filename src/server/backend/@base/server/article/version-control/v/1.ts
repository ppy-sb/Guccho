import { array, date, literal, number, object, string, tuple, union } from 'zod'
import { zodTipTapJSONContent } from '../../../../../../trpc/shapes'

export const v = 1 as const
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

export const contentSchema = object({
  json: zodTipTapJSONContent,
})
  .and(
    object({
      html: string(),
      dynamic: literal(false),
    })
      .or(object({
        dynamic: literal(true),
      }))
  )

export const metaSchema = object({
  privilege: object({
    read: array(readAccess),
    write: array(writeAccess),
  }).default(defaultPrivilege),
  owner: ownerId,
  created: tuple([ownerId, date()]),
  lastUpdated: tuple([ownerId, date()]),
})

export const schema = object({
  v: literal(v),
})
  .and(metaSchema)
  .and(contentSchema)

export const parse = schema.parse
