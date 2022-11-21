import { compareScope } from '$/transforms'
import { MutualRelationship, Relationship, Scope } from '~/types/common'
import { BaseUser, UserExtra, UserOptional, UserPreferences } from '~/types/user'

export const followUserPreferences = <Id>(user: BaseUser<Id> & Partial<UserExtra<Id> & Partial<UserOptional<Id>>> & {
  preferences: UserPreferences,
}, scope: Scope = 'public') => {
  // "reachable" | "oldNames" | "email" | "status"
  return {
    ...user,
    email: compareScope(scope, user.preferences.scope.email) ? user.email : undefined,
    oldNames: compareScope(scope, user.preferences.scope.oldNames) ? user.oldNames : undefined,
    reachable: compareScope(scope, user.preferences.scope.reachable) ? user.reachable : undefined,
    status: compareScope(scope, user.preferences.scope.status) ? user.status : undefined
  }
}

const rel: Record<
  Relationship,
  {
    mutual: MutualRelationship
  }
> = {
  friend: {
    mutual: 'mutual-friend'
  },
  block: {
    mutual: 'mutual-block'
  }
}
export const calculateMutualRelationships = (
  relationships: Relationship[],
  passiveRelationships: Relationship[]
) => {
  const mutualRelationships: MutualRelationship[] = []

  for (const [relation, { mutual }] of Object.entries(rel)) {
    if (passiveRelationships.includes(relation as Relationship)) {
      if (relationships.includes(relation as Relationship)) {
        mutualRelationships.push(mutual)
      }
    }
  }
  return mutualRelationships
}
