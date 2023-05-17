import * as v0 from './v/alpha'
import * as v1 from './v/v1'

import { createUpdatePath } from './path'

export * as v0 from './v/alpha'
export * as v1 from './v/v1'
export * as latest from './v/v1'

export const versions = {
  [v0.v]: v0,
  [v1.v]: v1,
}

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
    v: v1.v,
    created: [from.owner, new Date()] as [string | number, Date],
    lastUpdated: [from.owner, new Date()] as [string | number, Date],
  })),
]
