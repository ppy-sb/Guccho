import {
  MutualRelationship,
  Relationship,
  Scope,
} from '~/types/defs'
import type {
  ActiveMode,
  ActiveRuleset,
  AvailableRuleset,
  LeaderboardRankingSystem,
} from '~/types/common'
import type {
  UserEssential,
  UserExtra,
  UserOptional,
  UserSettings,
} from '~/types/user'

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

export function followUserSettings<
  Id,
  _Mode extends ActiveMode,
  _Ruleset extends ActiveRuleset,
  _RankingSystem extends LeaderboardRankingSystem,
>({
  user,
  scope = Scope.Public,
}: {
  user: UserEssential<Id> &
  Partial<
      UserExtra<Id, _Mode, AvailableRuleset<_Mode, _Ruleset>, _RankingSystem> & Partial<UserOptional>
    > & {
    settings: UserSettings
  }
  scope?: Scope
}) {
  if (scope === Scope.Self) {
    return user
  }

  return {
    ...user,
    email: compareScope(scope, user.settings.accessControl.email)
      ? user.email
      : undefined,
    oldNames: compareScope(scope, user.settings.accessControl.oldNames)
      ? user.oldNames
      : undefined,
    reachable: compareScope(scope, user.settings.accessControl.reachable)
      ? user.reachable
      : undefined,
    status: compareScope(scope, user.settings.accessControl.status)
      ? user.status
      : undefined,
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
