import type { IdType as Id } from '../config'
import { IdType } from '$/bancho.py/config'

export const createUserQuery = (handle: string | Id, selectAgainst: Array<'id' | 'name' | 'safeName' | 'email'> = ['id', 'name', 'safeName']) => {
  let handleNum = handle
  const handleStr = handle.toString().trim()
  if (typeof handleNum === 'string') {
    handleNum = parseInt(handleNum)
    if (isNaN(handleNum)) { handleNum = -1 }
  }

  return {
    where: {
      AND: [
        {
          OR: [
            selectAgainst.includes('id')
              ? {
                  id: handleNum
                }
              : undefined,
            selectAgainst.includes('name')
              ? {
                  name: handleStr
                }
              : undefined,
            selectAgainst.includes('safeName')
              ? {
                  safeName: handleStr.startsWith('@') ? handleStr.slice(1) : handleStr
                }
              : undefined,
            selectAgainst.includes('email')
              ? {
                  email: handleStr
                }
              : undefined
          ].filter(Boolean) as Array<{ id: IdType } | { name: string } | { safeName: string } | { email: string }>
        },
        {
          priv: {
            gte: 1
          }
        }
      ]
    }
  }
}
