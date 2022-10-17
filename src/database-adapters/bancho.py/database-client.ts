import { PrismaClient, Stat, User as DatabaseUser, RelationshipType } from '@prisma/client'
import { toRoles, BanchoPyMode } from './enums'
import { BaseUser, User, UserModeRulesetStatistics } from '~/prototyping/types/user'
import { Mode, Ruleset } from '~/prototyping/types/shared'
export const prisma = new PrismaClient()

type AvailableRankingSystems = 'ppv2' | 'rankedScore'| 'totalScore'

const toBaseUser = (user: DatabaseUser): BaseUser<number> => ({
  id: user.id,
  ingameId: user.id,
  name: user.name,
  safeName: user.safeName,
  email: user.email,
  flag: user.country,
  avatarUrl: '/images/1.png',
  roles: toRoles(user.priv)
})

export const getBaseUser = async (handle: string | number): Promise<BaseUser<number> | null> => {
  let _handle = handle
  if (typeof _handle === 'string') { _handle = parseInt(_handle) }
  const query = {
    where: {
      AND: [
        {
          OR: [
            {
              id: _handle
            },
            {
              name: handle.toString()
            },
            {
              safeName: handle.toString()
            }
          ]
        },
        {
          priv: {
            gte: 1
          }
        }
      ]
    }
  }
  const user = await prisma.user.findFirst(query)

  if (!user) { return null }

  return toBaseUser(user)
}

const createRulesetData = (databaseResult: Stat): UserModeRulesetStatistics<AvailableRankingSystems> => {
  return {
    ranking: {
      ppv2: {
        performance: databaseResult.pp
      },
      rankedScore: {
        score: databaseResult.rankedScore
      },
      totalScore: {
        score: databaseResult.totalScore
      }
    },
    playCount: databaseResult.plays,
    playTime: databaseResult.playTime,
    totalHits: databaseResult.totalHits
  }
}

export const getStatisticsOfUser = async ({ id }: {id: number}) => {
  const results = await prisma.stat.findMany({
    where: {
      id
    }
  })
  const statistics: User<number, false, Mode, Ruleset, AvailableRankingSystems>['statistics'] = {
    osu: {
      standard: createRulesetData(results[BanchoPyMode.osuStandard]),
      relax: createRulesetData(results[BanchoPyMode.osuRelax]),
      autopilot: createRulesetData(results[BanchoPyMode.osuAutopilot])
    },
    taiko: {
      standard: createRulesetData(results[BanchoPyMode.taikoStandard]),
      relax: createRulesetData(results[BanchoPyMode.taikoRelax])
    },
    fruits: {
      standard: createRulesetData(results[BanchoPyMode.fruitsStandard]),
      relax: createRulesetData(results[BanchoPyMode.fruitsRelax])
    },
    mania: {
      standard: createRulesetData(results[BanchoPyMode.maniaStandard])
    }
  }
  return statistics
}

export const getFullUser = async <HasSecrets extends boolean = false>(handle: string | number, secrets: HasSecrets): Promise<User<number, HasSecrets> | null> => {
  let _handle = handle
  if (typeof _handle === 'string') { _handle = parseInt(_handle) }
  const user = await prisma.user.findFirst({
    where: {
      AND: [
        {
          OR: [
            {
              id: _handle
            },
            {
              name: handle.toString()
            },
            {
              safeName: handle.toString()
            }
          ]
        },
        {
          priv: {
            gte: 1
          }
        }
      ]
    },
    include: {
      relations: {
        where: {
          type: RelationshipType.friend
        },
        include: {
          toUser: true
        }
      }
    }
  })

  if (!user) { return null }

  const returnValue: User<number, HasSecrets> = {
    id: user.id,
    ingameId: user.id,
    name: user.name,
    safeName: user.safeName,
    email: user.email,
    flag: user.country,
    avatarUrl: '/images/1.png',
    roles: toRoles(user.priv),
    statistics: await getStatisticsOfUser(user),
    preferences: {
      allowPrivateMessage: true,
      visibility: {
        email: 'nobody',
        oldNames: 'public'
      }
    },
    // TODO: get user reachable status
    reachable: false,
    // TODO: get user status
    status: 'website-online',
    oldNames: [],
    profile: (user.userpageContent && JSON.parse(user.userpageContent)) || {},
    friends: user.relations.map(relationship => toBaseUser(relationship.toUser))
  }

  if (secrets) {
    (returnValue as User<number, true>).secrets = {
      password: '',
      apiKey: ''
    }
  }

  return returnValue
}
