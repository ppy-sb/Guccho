import { IdType as Id } from '../config'
export const queryUser = (handle: string | Id) => {
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
