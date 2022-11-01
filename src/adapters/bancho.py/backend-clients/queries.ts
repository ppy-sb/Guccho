import type { IdType as Id } from '../config'

export const createUserQuery = (handle: string | number | Id) => {
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
            {
              id: handleNum
            },
            {
              name: handleStr
            },
            {
              safeName: handleStr.startsWith('@') ? handleStr.slice(1) : handleStr
            }
          ]
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
