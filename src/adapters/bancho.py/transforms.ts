import { Stat, User as DatabaseUser, RelationshipType } from '@prisma/client'
import type { IdType as Id } from './config'
import { BanchoPyPrivilege } from './enums'
import type { Mode, Ruleset, RankingSystem, Scope } from '~/types/common'
import type {
  UserModeRulesetStatistics,
  BaseUser,
  UserPrivilegeString,
  UserOptional,
  UserRelationship,
  UserExtra,
  UserSecrets
} from '~/types/user'

export function createRulesetData<
  Id,
  _Mode extends Mode,
  _Ruleset extends Ruleset,
  _RankingSystem extends RankingSystem
> ({
  databaseResult,
  ranks,
  livePPRank
}: {
  databaseResult?: Stat
  ranks?: {
    ppv2Rank: number | bigint
    totalScoreRank: number | bigint
    rankedScoreRank: number | bigint
  }
  livePPRank?: {
    rank: number | null
    countryRank: number | null
  }
}) {
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
    } as UserModeRulesetStatistics<Id, _Mode, _Ruleset, _RankingSystem>
  }
  return {
    ranking: {
      ppv2: {
        rank:
          livePPRank?.rank || Number(ranks?.ppv2Rank) || undefined,
        countryRank:
          livePPRank?.countryRank || undefined,
        performance: databaseResult.pp
      },
      rankedScore: {
        rank: Number(ranks?.rankedScoreRank) || undefined,
        score: databaseResult.rankedScore
      },
      totalScore: {
        rank: Number(ranks?.totalScoreRank) || undefined,
        score: databaseResult.totalScore
      }
    },
    playCount: databaseResult.plays,
    playTime: databaseResult.playTime,
    totalHits: databaseResult.totalHits
  } as UserModeRulesetStatistics<Id, _Mode, _Ruleset, _RankingSystem>
}

export function toRoles (priv: number): UserPrivilegeString[] {
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

export function toBaseUser<
  Includes extends Partial<Record<keyof UserOptional<Id>, boolean>> = Record<
    never,
    never
  >
> ({ user, includes }: { user: DatabaseUser, includes?: Includes }) {
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

export function dedupeUserRelationship (
  relations: {
    type: RelationshipType
    toUserId: Id
    toUser: BaseUser<Id>
  }[]
) {
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

export function toFullUser<
  IncludeMode extends Mode,
  IncludeRulesets extends Ruleset,
  IncludeRankingSystem extends RankingSystem,
  Optional extends Partial<UserOptional<Id>> = Partial<UserOptional<Id>>,
  Extra extends Partial<
    UserExtra<Id, IncludeMode, IncludeRulesets, IncludeRankingSystem>
  > = Partial<
    UserExtra<Id, IncludeMode, IncludeRulesets, IncludeRankingSystem>
  >
> ({
  user,
  extraFields
}: {
  user: DatabaseUser
  extraFields: Optional & Extra
}) {
  return {
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
      } as const
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
}

export function compareScope (scope: Scope, requiredScope: Scope) {
  if (requiredScope === 'public') {
    return true
  }
  if (requiredScope === 'friends') {
    return scope === 'friends'
  }
  if (requiredScope === 'self') {
    return scope === 'self'
  }
}

export function capitalizeFirstLetter<T extends string> (string: T) {
  return (string.charAt(0).toUpperCase() + string.slice(1)) as Capitalize<T>
}
