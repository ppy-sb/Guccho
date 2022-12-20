import type { Id } from '~/adapters/ppy.sb@bancho.py/config'

export const createUserQuery = (handle: string, selectAgainst: Array<'id' | 'name' | 'safeName' | 'email'> = ['id', 'name', 'safeName']) => {
  let handleNum = parseInt(handle)
  if (isNaN(handleNum))
    handleNum = -1

  return {
    where: {
      AND: [
        {
          OR: [
            selectAgainst.includes('id')
              ? {
                  id: handleNum,
                }
              : undefined,
            selectAgainst.includes('name')
              ? {
                  name: handle,
                }
              : undefined,
            selectAgainst.includes('safeName')
              ? {
                  safeName: handle.startsWith('@') ? handle.slice(1) : handle,
                }
              : undefined,
            selectAgainst.includes('email')
              ? {
                  email: handle,
                }
              : undefined,
          ].filter(Boolean) as Array<{ id: Id } | { name: string } | { safeName: string } | { email: string }>,
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
