import {
  MutualRelationship,
  Relationship,

} from '~/def'

import {
  Scope,
} from '~/def/user'

export function compareScope(scope: Scope, requiredScope: Partial<Record<Scope, boolean>>) {
  if (scope === Scope.Public) {
    return requiredScope[Scope.Public]
  }

  if (scope === Scope.Friends) {
    return requiredScope[Scope.Friends] || requiredScope[Scope.Public]
  }

  if (scope === Scope.Self) {
    return true
  }
}

const rel = [
  [Relationship.Friend, MutualRelationship.MutualFriend],
  [Relationship.Blocked, MutualRelationship.MutualBlocked],
] as const
export function calculateMutualRelationships(relationships: Relationship[],
  passiveRelationships: Relationship[]) {
  const mutualRelationships: MutualRelationship[] = []

  for (const [relation, mutual] of rel) {
    if (passiveRelationships.includes(relation)) {
      if (relationships.includes(relation)) {
        mutualRelationships.push(mutual)
      }
    }
  }
  return mutualRelationships
}
