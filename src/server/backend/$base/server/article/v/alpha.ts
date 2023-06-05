import { any, array, literal, number, object, string, union } from 'zod'
import { zodTipTapJSONContent } from '~/server/trpc/shapes'

export const v = Symbol('dev-unstable')
export const writeAccess = union([
  literal('self'),
  literal('staff'),
  literal('moderator'),
  literal('beatmapNominator'),
])
export const readAccess = writeAccess.or(literal('public'))

export const defaultPrivilege = {
  read: ['public' as const],
  write: ['staff' as const],
}
export const ownerId = union([string().trim(), number()])

export const contentSchema = object({
  json: zodTipTapJSONContent,
  html: string(),
})

export const metaSchema = object({
  privilege: object({
    read: array(readAccess).default(defaultPrivilege.read),
    write: array(writeAccess).default(defaultPrivilege.write),
  }).default(defaultPrivilege),
  owner: ownerId,
})

export const schema = object({
  v: any(),
})
  .and(contentSchema)
  .and(metaSchema)

export const parse = schema.parse
