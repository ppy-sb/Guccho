import { Stat, User as DatabaseUser } from '@prisma/client'
import type { AvailableRankingSystems, IdType as Id } from '../config'
import { BanchoPyPrivilege } from './enums'
import type {
  UserModeRulesetStatistics,
  BaseUser,
  SecretBaseUser,
  UserPrivilegeString
} from '~/prototyping/types/user'

export const createRulesetData = (
  databaseResult: Stat | undefined,
  ranks:
    | {
        ppv2Rank: number | bigint;
        totalScoreRank: number | bigint;
        rankedScoreRank: number | bigint;
      }
    | undefined,
  livePPRank: {
    rank: number | null,
    countryRank: number | null
  } | false
): UserModeRulesetStatistics<AvailableRankingSystems> => {
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
        rank: (livePPRank !== false && livePPRank.rank) || (ranks && Number(ranks.ppv2Rank)),
        countryRank: (livePPRank !== false && livePPRank.countryRank) || undefined,
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
  if (priv & BanchoPyPrivilege.Normal) { roles.push('registered') }
  if (priv & BanchoPyPrivilege.Verified) { roles.push('normal') }
  if (priv & BanchoPyPrivilege.Whitelisted) { roles.push('bypassAntiCheat') }
  if (priv & BanchoPyPrivilege.Donator) { roles.push('supporter') }
  if (priv & BanchoPyPrivilege.Alumni) { roles.push('alumni') }
  if (priv & BanchoPyPrivilege.Tournament) { roles.push('tournamentStuff') }
  if (priv & BanchoPyPrivilege.Nominator) { roles.push('beatmapNominator') }
  if (priv & BanchoPyPrivilege.Mod) { roles.push('moderator') }
  if (priv & BanchoPyPrivilege.Staff) { roles.push('staff') }
  if (priv & BanchoPyPrivilege.Admin) { roles.push('admin') }
  if (priv & BanchoPyPrivilege.Dangerous) { roles.push('owner') }
  if (priv & BanchoPyPrivilege.Bot) { roles.push('bot') }
  return roles
}

export const toBaseUser = <Secret extends boolean = false>(user: DatabaseUser, secrets?: Secret): Secret extends true ? SecretBaseUser<Id> : BaseUser<Id> => {
  const base: BaseUser<Id> = {
    id: user.id,
    ingameId: user.id,
    name: user.name,
    safeName: user.safeName,
    email: user.email,
    flag: user.country,
    avatarUrl: `https://a.ppy.sb/${user.id}`,
    roles: toRoles(user.priv)
  }

  if (secrets) {
    (base as SecretBaseUser<Id>).secrets = {
      password: user.pwBcrypt,
      apiKey: user.apiKey || undefined
    }
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return base
}