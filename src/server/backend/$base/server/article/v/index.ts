import { createEdge } from 'schema-evolution'

import * as v0 from './alpha'
import * as v1 from './v1'
import * as v2 from './v2'

export * as v0 from './alpha'
export * as v1 from './v1'
export * as v2 from './v2'

export * as latest from './v2'

export const versions = {
  [v0.v]: v0,
  [v1.v]: v1,
  [v2.v]: v2,
}

export const paths = [
  createEdge(v0, v1, from => ({
    html: from.html,
    json: from.json,
    owner: from.owner,
    privilege: {
      read: from.privilege.read.filter(v1.filterSelf),
      write: from.privilege.write.filter(v1.filterSelf),
    },
    dynamic: false as const,
    v: v1.v,
    created: [from.owner, new Date()] as [string | number, Date],
    lastUpdated: [from.owner, new Date()] as [string | number, Date],
  })),
  createEdge(v1, v2, (from) => {
    return {
      ...from,
      v: v2.v,
      privilege: {
        read: from.privilege.read.map(v => v === v1.ReadAccess.Public ? v2.ReadAccess.Public : v),
        write: from.privilege.write,
      },
    }
  }),
]
