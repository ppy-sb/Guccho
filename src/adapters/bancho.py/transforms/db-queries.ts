import type { Prisma } from '.prisma/bancho.py'
import { BanchoMode } from '../enums'
import type { DatabaseUserEssentialFields } from './user'
import type { OP, Tag } from '~/types/search'
import { TSFilter, includes } from '~/utils'
export const userEssentials = {
  select: {
    id: true,
    name: true,
    safeName: true,
    country: true,
    priv: true,
    pwBcrypt: true,
    apiKey: true,
    email: true,
  },
} as const satisfies {
  select: Record<DatabaseUserEssentialFields, true>
}
export function createUserQuery(handle: string,
  selectAgainst: Array<'id' | 'name' | 'safeName' | 'email'> = [
    'id',
    'name',
    'safeName',
  ]) {
  let handleNum = +handle
  if (isNaN(handleNum)) {
    handleNum = -1
  }

  return {
    where: {
      AND: [
        {
          OR: [
            includes('safeName', selectAgainst)
              ? {
                  safeName: handle.startsWith('@') ? handle.slice(1) : handle,
                }
              : undefined,
            includes('name', selectAgainst)
              ? {
                  name: handle,
                }
              : undefined,
            includes('email', selectAgainst)
              ? {
                  email: handle,
                }
              : undefined,
            includes('id', selectAgainst)
              ? {
                  id: handleNum,
                }
              : undefined,
          ].filter(TSFilter),
        },
        {
          priv: {
            gte: 1,
          },
        },
      ],
    },
  }
}

const prismaOperator: Record<OP, keyof Prisma.IntFilter> = {
  eq: 'equals',
  ne: 'not',
  lt: 'lt',
  lte: 'lte',
  gt: 'gt',
  gte: 'gte',
}
export function createFilter(tags: Tag[]) {
  type Filter = Prisma.Enumerable<Prisma.MapWhereInput>

  const filter: Filter = []
  tags.forEach((tag) => {
    const [key, op, value] = tag
    const operator = prismaOperator[op]

    switch (key) {
      case 'mode': {
        filter.push({ mode: { [operator]: BanchoMode[value] } })
        break
      }
      case 'starRating': {
        filter.push({ diff: { [operator]: BanchoMode[value] } })
        break
      }
      case 'accuracy': {
        filter.push({ od: { [operator]: BanchoMode[value] } })
        break
      }
      case 'approachRate': {
        filter.push({ ar: { [operator]: BanchoMode[value] } })
        break
      }
      case 'circleSize': {
        filter.push({ cs: { [operator]: BanchoMode[value] } })
        break
      }
      case 'hpDrain': {
        filter.push({ hp: { [operator]: BanchoMode[value] } })
        break
      }
      case 'length': {
        filter.push({ totalLength: { [operator]: BanchoMode[value] } })
        break
      }
      default: {
        filter.push({ [key]: { [operator]: BanchoMode[value] } })
      }
    }
  })
  return filter
}
