import type { Mode, MutualRelationship, OverallLeaderboardRankingSystem, Relationship, Ruleset, Scope } from '~/types/common'
import type { UserEssential, UserExtra, UserOptional, UserPreferences } from '~/types/user'

export function compareScope(scope: Scope, requiredScope: Partial<Record<Scope, boolean>>) {
  if (scope === 'public')
    return requiredScope.public

  if (scope === 'friends')
    return requiredScope.friends || requiredScope.public

  if (scope === 'self')
    return true
}

export function followUserPreferences<Id, _Mode extends Mode, _Ruleset extends Ruleset, _RankingSystem extends OverallLeaderboardRankingSystem>({ user, scope = 'public' }: {
  user: UserEssential<Id> & Partial<UserExtra<Id, _Mode, _Ruleset, _RankingSystem> & Partial<UserOptional<Id>>> & {
    preferences: UserPreferences
  }
  scope?: Scope
}) {
  if (scope === 'self')
    return user

  return {
    ...user,
    email: compareScope(scope, user.preferences.visibility.email) ? user.email : undefined,
    oldNames: compareScope(scope, user.preferences.visibility.oldNames) ? user.oldNames : undefined,
    reachable: compareScope(scope, user.preferences.visibility.reachable) ? user.reachable : undefined,
    status: compareScope(scope, user.preferences.visibility.status) ? user.status : undefined,
  }
}

const rel: Record<Relationship, {
  mutual: MutualRelationship
}> = {
  friend: {
    mutual: 'mutual-friend',
  },
  block: {
    mutual: 'mutual-block',
  },
}
export const calculateMutualRelationships = (
  relationships: Relationship[],
  passiveRelationships: Relationship[],
) => {
  const mutualRelationships: MutualRelationship[] = []

  for (const [relation, { mutual }] of Object.entries(rel)) {
    if (passiveRelationships.includes(relation as Relationship)) {
      if (relationships.includes(relation as Relationship))
        mutualRelationships.push(mutual)
    }
  }
  return mutualRelationships
}
