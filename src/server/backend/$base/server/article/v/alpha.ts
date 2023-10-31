import { any, array, nativeEnum, number, object, string, union } from 'zod'
import { UserRole } from '~/def/user'
import { zodTipTapJSONContent } from '~/server/trpc/shapes'

export const v = Symbol('dev-unstable')

export type TWriteAccess = typeof WriteAccess[keyof typeof WriteAccess]
export const WriteAccess = {
  Self: 'self',
  Staff: UserRole.Staff,
  Moderator: UserRole.Moderator,
  BeatmapNominator: UserRole.BeatmapNominator,
} as const

export type TReadAccess = typeof ReadAccess[keyof typeof ReadAccess]
export const ReadAccess = {
  ...WriteAccess,
  Public: 'public',
} as const

export const writeAccess = nativeEnum(WriteAccess)

export const readAccess = nativeEnum(ReadAccess)

export const defaultPrivilege = {
  read: [ReadAccess.Public],
  write: [WriteAccess.Staff],
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
