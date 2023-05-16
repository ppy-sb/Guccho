import { any, array, literal, number, object, string, union } from 'zod'
import { zodTipTapJSONContent } from '../../../../../../trpc/shapes'

export const v = Symbol('nothing')
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
export const ownerId = union([string(), number()])

export const schema = object({
  json: zodTipTapJSONContent,
  v: any(),
  privilege: object({
    read: array(readAccess).default(defaultPrivilege.read),
    write: array(writeAccess).default(defaultPrivilege.write),
  }).default(defaultPrivilege),
  owner: ownerId,
  html: string(),
})
