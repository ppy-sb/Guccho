import type { Map as DBMap, Score as DBScore, User as DatabaseUser, RelationshipType, Source, Stat } from '@prisma/client'
import type { IdType as Id } from '../config'
import type { BanchoPyRankedStatus } from '../enums'
import { BanchoPyPrivilege, toBanchoRankingStatus } from '../enums'
import { getLevelWithProgress } from './level-calc'
import type { RankingStatus } from '~/types/beatmap'
import { RankingStatusEnum } from '~/types/beatmap'
import type { Mode, RankingSystem, Ruleset, Scope } from '~/types/common'
import type {
  BaseUser,
  UserOptional,
  UserPrivilegeString,
  UserRelationship,
  UserSecrets,
} from '~/types/user'
import type { UserModeRulesetStatistics } from '~~/src/types/statistics'

export function createRulesetData<
  Id,
  _Mode extends Mode,
  _Ruleset extends Ruleset,
  _RankingSystem extends RankingSystem,
>({
  databaseResult: dbResult,
  ranks,
  livePPRank,
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
  if (dbResult == null) {
    return {

      ppv2: {
        rank: 0,
        performance: 0,
      },
      rankedScore: {
        rank: 0,
        score: BigInt(0),
      },
      totalScore: {
        rank: 0,
        score: BigInt(0),
      },

      playCount: 0,
      playTime: 0,
      totalHits: 0,
      level: 0,
    } as UserModeRulesetStatistics<Id, _Mode, _Ruleset, _RankingSystem>
  }
  return {
    ppv2: {
      rank:
          livePPRank?.rank || Number(ranks?.ppv2Rank) || undefined,
      countryRank:
          livePPRank?.countryRank || undefined,
      performance: dbResult.pp,
    },
    rankedScore: {
      rank: Number(ranks?.rankedScoreRank) || undefined,
      score: dbResult.rankedScore,
    },
    totalScore: {
      rank: Number(ranks?.totalScoreRank) || undefined,
      score: dbResult.totalScore,
    },
    playCount: dbResult.plays,
    playTime: dbResult.playTime,
    totalHits: dbResult.totalHits,
    level: getLevelWithProgress(dbResult.totalScore),
  } as UserModeRulesetStatistics<Id, _Mode, _Ruleset, _RankingSystem>
}

export function toRoles(priv: number): UserPrivilegeString[] {
  const roles: UserPrivilegeString[] = []
  if (priv & BanchoPyPrivilege.Normal)
    roles.push('registered')

  if (priv & BanchoPyPrivilege.Verified)
    roles.push('normal')

  if (priv & BanchoPyPrivilege.Whitelisted)
    roles.push('bypassAntiCheat')

  if (priv & BanchoPyPrivilege.Donator)
    roles.push('supporter')

  if (priv & BanchoPyPrivilege.Alumni)
    roles.push('alumni')

  if (priv & BanchoPyPrivilege.Tournament)
    roles.push('tournamentStuff')

  if (priv & BanchoPyPrivilege.Nominator)
    roles.push('beatmapNominator')

  if (priv & BanchoPyPrivilege.Mod)
    roles.push('moderator')

  if (priv & BanchoPyPrivilege.Staff)
    roles.push('staff')

  if (priv & BanchoPyPrivilege.Admin)
    roles.push('admin')

  if (priv & BanchoPyPrivilege.Dangerous)
    roles.push('owner')

  if (priv & BanchoPyPrivilege.Bot)
    roles.push('bot')

  return roles
}

export function toBaseUser<
  Includes extends Partial<Record<keyof UserOptional<Id>, boolean>> = Record<
    never,
    never
  >,
>({ user, includes }: { user: DatabaseUser; includes?: Includes }) {
  const returnValue: BaseUser<Id> & Partial<UserOptional<Id>> = {
    id: user.id,
    ingameId: user.id,
    name: user.name,
    safeName: user.safeName,
    flag: user.country,
    avatarUrl: `https://a.ppy.sb/${user.id}`,
    roles: toRoles(user.priv),
  }

  if (includes?.secrets) {
    returnValue.secrets = {
      password: user.pwBcrypt,
      apiKey: user.apiKey || undefined,
    }
  }

  if (includes?.email)
    returnValue.email = user.email

  return returnValue as Includes['secrets'] extends true
    ? BaseUser<Id> & { secrets: UserSecrets }
    : BaseUser<Id>
}

export function dedupeUserRelationship(
  relations: Array<{
    type: RelationshipType
    toUserId: Id
    toUser: BaseUser<Id>
  }>,
) {
  const reduceUserRelationships = relations.reduce((acc, cur) => {
    if (!acc.has(cur.toUserId)) {
      acc.set(cur.toUserId, {
        ...cur.toUser,
        relationship: [cur.type],
        relationshipFromTarget: [],
        mutualRelationship: [],
      })
    }
    else {
      acc.get(cur.toUserId)?.relationship.push(cur.type)
    }
    return acc
  }, new Map<Id, UserRelationship<Id>>())

  return [...reduceUserRelationships.values()]
}

export function toFullUser(user: DatabaseUser) {
  return {
    id: user.id,
    ingameId: user.id,
    name: user.name,
    safeName: user.safeName,
    flag: user.country,
    avatarUrl: `https://a.ppy.sb/${user.id}`,
    roles: toRoles(user.priv),
    preferences: {
      scope: {
        reachable: 'public',
        status: 'public',
        privateMessage: 'public',
        email: 'self',
        oldNames: 'public',
      } as const,
    },
    oldNames: [],
  }
}

export function compareScope(scope: Scope, requiredScope: Scope) {
  if (requiredScope === 'public')
    return true

  if (requiredScope === 'friends')
    return scope === 'friends'

  if (requiredScope === 'self')
    return scope === 'self'
}

export function capitalizeFirstLetter<T extends string>(string: T) {
  return (string.charAt(0).toUpperCase() + string.slice(1)) as Capitalize<T>
}

export function toRankingStatus(status: BanchoPyRankedStatus) {
  return RankingStatusEnum[toBanchoRankingStatus(status)] as RankingStatus | undefined
}

export type AbleToTransformToScores = (DBScore & {
  beatmap: DBMap & {
    source: Source
  } | null
})

