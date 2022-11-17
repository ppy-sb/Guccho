import { Stat, User as DatabaseUser, RelationshipType } from '@prisma/client'
import type { Mode, Ruleset, RankingSystem, IdType as Id } from '../config'
import { BanchoPyPrivilege } from './enums'
import type {
  MutualRelationship,
  Relationship,
  Scope
} from '~/types/common'
import type {
  UserModeRulesetStatistics,
  BaseUser,
  UserPrivilegeString,
  UserOptional,
  UserRelationship,
  UserExtra,
  UserPreferences,
  UserSecrets
} from '~/types/user'

export const createRulesetData = <Id, _Mode extends Mode, _Ruleset extends Ruleset, _RankingSystem extends RankingSystem>(
  databaseResult: Stat | undefined,
  ranks:
    | {
      ppv2Rank: number | bigint
      totalScoreRank: number | bigint
      rankedScoreRank: number | bigint
    }
    | undefined,
  livePPRank:
    | {
      rank: number | null
      countryRank: number | null
    }
    | false
): UserModeRulesetStatistics<Id, _Mode, _Ruleset, _RankingSystem> => {
  if (!databaseResult) {
    return {
      ranking: {
        ppv2: {
          rank: 0,
          performance: 0
        },
        rankedScore: {
          rank: 0,
          score: BigInt(0)
        },
        totalScore: {
          rank: 0,
          score: BigInt(0)
        }
      },
      playCount: 0,
      playTime: 0,
      totalHits: 0
    }
  }
  return {
    ranking: {
      ppv2: {
        rank:
          (livePPRank !== false && livePPRank.rank) ||
          (ranks && Number(ranks.ppv2Rank)),
        countryRank:
          (livePPRank !== false && livePPRank.countryRank) || undefined,
        performance: databaseResult.pp
      },
      rankedScore: {
        rank: ranks && Number(ranks.rankedScoreRank),
        score: databaseResult.rankedScore
      },
      totalScore: {
        rank: ranks && Number(ranks.totalScoreRank),
        score: databaseResult.totalScore
      }
    },
    playCount: databaseResult.plays,
    playTime: databaseResult.playTime,
    totalHits: databaseResult.totalHits
  }
}

export const toRoles = (priv: number): UserPrivilegeString[] => {
  const roles: UserPrivilegeString[] = []
  if (priv & BanchoPyPrivilege.Normal) {
    roles.push('registered')
  }
  if (priv & BanchoPyPrivilege.Verified) {
    roles.push('normal')
  }
  if (priv & BanchoPyPrivilege.Whitelisted) {
    roles.push('bypassAntiCheat')
  }
  if (priv & BanchoPyPrivilege.Donator) {
    roles.push('supporter')
  }
  if (priv & BanchoPyPrivilege.Alumni) {
    roles.push('alumni')
  }
  if (priv & BanchoPyPrivilege.Tournament) {
    roles.push('tournamentStuff')
  }
  if (priv & BanchoPyPrivilege.Nominator) {
    roles.push('beatmapNominator')
  }
  if (priv & BanchoPyPrivilege.Mod) {
    roles.push('moderator')
  }
  if (priv & BanchoPyPrivilege.Staff) {
    roles.push('staff')
  }
  if (priv & BanchoPyPrivilege.Admin) {
    roles.push('admin')
  }
  if (priv & BanchoPyPrivilege.Dangerous) {
    roles.push('owner')
  }
  if (priv & BanchoPyPrivilege.Bot) {
    roles.push('bot')
  }
  return roles
}

export const toBaseUser = <
  Includes extends Partial<Record<keyof UserOptional<Id>, boolean>> = Record<
    never,
    never
  >
>(
    user: DatabaseUser,
    includes?: Includes
  ) => {
  const returnValue: BaseUser<Id> & Partial<UserOptional<Id>> = {
    id: user.id,
    ingameId: user.id,
    name: user.name,
    safeName: user.safeName,
    flag: user.country,
    avatarUrl: `https://a.ppy.sb/${user.id}`,
    roles: toRoles(user.priv)
  }

  if (includes?.secrets) {
    returnValue.secrets = {
      password: user.pwBcrypt,
      apiKey: user.apiKey || undefined
    }
  }

  if (includes?.email) {
    returnValue.email = user.email
  }

  return returnValue as Includes['secrets'] extends true
    ? BaseUser<Id> & { secrets: UserSecrets }
    : BaseUser<Id>
}

export const dedupeUserRelationship = (
  relations: {
    type: RelationshipType
    toUserId: Id
    toUser: BaseUser<Id>
  }[]
) => {
  const reduceUserRelationships = relations.reduce((acc, cur) => {
    if (!acc.has(cur.toUserId)) {
      acc.set(cur.toUserId, {
        ...cur.toUser,
        relationship: [cur.type],
        relationshipFromTarget: [],
        mutualRelationship: []
      })
    } else {
      acc.get(cur.toUserId)?.relationship.push(cur.type)
    }
    return acc
  }, new Map<Id, UserRelationship<Id>>())

  return [...reduceUserRelationships.values()]
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

export const toFullUser = <
  Extend extends Partial<UserOptional<Id>> & Partial<UserExtra<Id>>
>(
    user: DatabaseUser,
    extraFields: Extend
  ) => {
  const returnValue =
  {
    id: user.id,
    ingameId: user.id,
    name: user.name,
    safeName: user.safeName,
    email: extraFields.email,
    flag: user.country,
    avatarUrl: `https://a.ppy.sb/${user.id}`,
    roles: toRoles(user.priv),
    statistics: extraFields.statistics,
    preferences: {
      scope: {
        reachable: 'public',
        status: 'public',
        privateMessage: 'public',
        email: 'self',
        oldNames: 'public'
      }
    },
    // TODO: get user reachable status
    reachable: extraFields.reachable,
    // TODO: get user status
    status: extraFields.status,
    oldNames: extraFields.oldNames || [],
    profile: (user.userpageContent && JSON.parse(user.userpageContent)) || {
      type: 'doc',
      content: []
    },
    relationships: extraFields.relationships,
    secrets: extraFields.secrets
  }
  return returnValue as BaseUser<Id> & UserExtra<Id> & {
    statistics: Extend['statistics'],
    status: Extend['status']
    secrets: Extend['secrets'],
    email: Extend['email'],
    reachable: Extend['reachable'],
    relationships: Extend['relationships']
  }
}

export const compareScope = (scope: Scope, requiredScope: Scope) => {
  if (requiredScope === 'public') { return true }
  if (requiredScope === 'friends') { return scope === 'friends' }
  if (requiredScope === 'self') { return scope === 'self' }
}

export const followUserPreferences = (user: BaseUser<Id> & Partial<UserExtra<Id> & Partial<UserOptional<Id>>> & {
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
