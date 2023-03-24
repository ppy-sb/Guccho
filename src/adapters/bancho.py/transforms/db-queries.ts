import type { DatabaseUserEssentialFields } from './user'
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
