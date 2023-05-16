import { createUpdatePath } from './path'
import { v0, v1 } from './v'

export const paths = [
  createUpdatePath(v0, v1, (from) => {
    console.log('update from v0 to v1', from)
    type TFrom = typeof from
    type TPriv = TFrom['privilege']['read'] | TFrom['privilege']['write']
    const filterSelf = <T extends TPriv[number]>(i: T): i is Exclude<T, 'self'> => i !== 'self'

    return {
      html: from.html,
      json: from.json,
      owner: from.owner,
      privilege: {
        read: from.privilege.read.filter(filterSelf),
        write: from.privilege.write.filter(filterSelf),
      },
      dynamic: false as const,
      v: 1,
      created: [from.owner, new Date()] as [string | number, Date],
      lastUpdated: [from.owner, new Date()] as [string | number, Date],
    }
  }),
]
