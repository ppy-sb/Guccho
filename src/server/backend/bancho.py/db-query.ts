import type { Prisma } from '.prisma/bancho.py'
import { BanchoPyPrivilege, toBanchoMode } from './enums'
import type { DatabaseUserEssentialFields } from './transforms/user'
import { stringToId } from './transforms'
import type { OP, Tag } from '~/types/search'

export const userEssentials: Prisma.UserFindManyArgs = {
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

export function createUserLikeQuery(keyword: string) {
  const idKw = stringToId(keyword)
  return {
    where: {
      OR: [
        keyword.startsWith('@')
          ? {
              safeName: {
                contains: keyword.slice(1),
              },
            }
          : undefined,
        {
          safeName: {
            contains: keyword,
          },
        },
        {
          name: {
            contains: keyword,
          },
        },
        Number.isNaN(idKw)
          ? undefined
          : {
              id: idKw,
            },
        // TODO: search by email after preferences implemented
        // {
        //   email: {
        //     contains: keyword,
        //   },
        // },
      ].filter(TSFilter),
    },
  }
}
export function createUserQuery(
  {
    handle,
    selectAgainst = ['id', 'name', 'safeName'],
    privilege = BanchoPyPrivilege.Verified,
  }: {
    handle: string
    selectAgainst?: Array<'id' | 'name' | 'safeName' | 'email'>
    privilege?: BanchoPyPrivilege
  }
) {
  let handleNum = +handle
  if (Number.isNaN(handleNum)) {
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
            gte: privilege,
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
        filter.push({ mode: { [operator]: toBanchoMode(value) } })
        break
      }
      case 'starRating': {
        filter.push({ diff: { [operator]: value } })
        break
      }
      case 'accuracy': {
        filter.push({ od: { [operator]: value } })
        break
      }
      case 'approachRate': {
        filter.push({ ar: { [operator]: value } })
        break
      }
      case 'circleSize': {
        filter.push({ cs: { [operator]: value } })
        break
      }
      case 'hpDrain': {
        filter.push({ hp: { [operator]: value } })
        break
      }
      case 'length': {
        filter.push({ totalLength: { [operator]: value } })
        break
      }
      default: {
        filter.push({ [key]: { [operator]: value } })
      }
    }
  })
  return filter
}
