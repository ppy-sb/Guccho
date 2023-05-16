import { createUpdatePath } from './path'
import { v0, v1 } from './v'

const filterSelf = <T>(i: T): i is Exclude<T, 'self'> => i !== 'self'
export const paths = [
  createUpdatePath(v0, v1, from => ({
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
  })),
]
