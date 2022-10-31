import {
  PrismaClient,
  RelationshipType
} from '@prisma/client'
import { createClient } from 'redis'

import type { AvailableRankingSystems, IdType as Id } from '../config'
import { PassiveRelationship } from './../../../prototyping/types/shared'
import { BanchoPyMode } from './enums'
import { createUserQuery } from './queries'
import { createRulesetData, toBaseUser, toRoles } from './transforms'
import { UserRelationship } from '~/prototyping/types/user'

import type { Mode, Ruleset, Relationship } from '~/prototyping/types/shared'
import type { User } from '~/prototyping/types/user'

export const prismaClient = new PrismaClient()
const redisClient = Boolean(process.env.REDIS_URI) && createClient({
  url: process.env.REDIS_URI
})

export const getBaseUser = async <HasSecrets extends boolean = false>(
  handle: string | Id,
  secrets?: HasSecrets
) => {
  const user = await prismaClient.user.findFirst(createUserQuery(handle))

  if (!user) {
    return null
  }

  return toBaseUser(user, secrets)
}

export const getBaseUsers = async <HasSecrets extends boolean = false>(
  handle: string | Id,
  secrets?: HasSecrets
) => {
  const users = await prismaClient.user.findMany(createUserQuery(handle))

  return users.map(user => toBaseUser(user, secrets))
}

const getLiveRank = async (id: number, mode: number, country: string) => redisClient && ({
  rank: await redisClient.zRevRank(`bancho:leaderboard:${mode}`, id.toString()),
  countryRank: await redisClient.zRevRank(`bancho:leaderboard:${mode}:${country}`, id.toString())
})

export const getStatisticsOfUser = async ({ id, country }: { id: Id, country: string }) => {
  const [results, ranks, livePPRank] = await Promise.all([
    prismaClient.stat.findMany({
      where: {
        id
      }
    }),

    prismaClient.$queryRaw<
      Array<{
        id: Id;
        mode: number;
        ppv2Rank: bigint;
        totalScoreRank: bigint;
        rankedScoreRank: bigint;
      }>
    >/* sql */`
  WITH ranks AS (
    SELECT
      id,
      mode,
      RANK () OVER (
        PARTITION BY mode
        ORDER BY pp desc
      ) ppv2Rank,
      RANK () OVER (
        PARTITION BY mode
        ORDER BY tscore desc
      ) totalScoreRank,
      RANK () OVER (
        PARTITION BY mode
        ORDER BY rscore desc
      ) rankedScoreRank
    FROM stats
  )
  SELECT * FROM ranks
  WHERE id = ${id}
  `,

    redisClient && {
      osu: {
        standard: await getLiveRank(id, BanchoPyMode.osuStandard, country),
        relax: await getLiveRank(id, BanchoPyMode.osuRelax, country),
        autopilot: await getLiveRank(id, BanchoPyMode.osuAutopilot, country)
      },
      taiko: {
        standard: await getLiveRank(id, BanchoPyMode.osuStandard, country),
        relax: await getLiveRank(id, BanchoPyMode.osuRelax, country)
      },
      fruits: {
        standard: await getLiveRank(id, BanchoPyMode.osuStandard, country),
        relax: await getLiveRank(id, BanchoPyMode.osuRelax, country)
      },
      mania: {
        standard: await getLiveRank(id, BanchoPyMode.osuStandard, country)
      }
    }
  ])

  const statistics: User<
    Id,
    false,
    Mode,
    Ruleset,
    AvailableRankingSystems
  >['statistics'] = {
    osu: {
      standard: createRulesetData(
        results.find(i => i.mode === BanchoPyMode.osuStandard),
        ranks.find(i => i.mode === BanchoPyMode.osuStandard),
        livePPRank && livePPRank.osu.standard
      ),
      relax: createRulesetData(
        results.find(i => i.mode === BanchoPyMode.osuRelax),
        ranks.find(i => i.mode === BanchoPyMode.osuRelax),
        livePPRank && livePPRank.osu.relax
      ),
      autopilot: createRulesetData(
        results.find(i => i.mode === BanchoPyMode.osuAutopilot),
        ranks.find(i => i.mode === BanchoPyMode.osuAutopilot),
        livePPRank && livePPRank.osu.autopilot
      )
    },
    taiko: {
      standard: createRulesetData(
        results.find(i => i.mode === BanchoPyMode.taikoStandard),
        ranks.find(i => i.mode === BanchoPyMode.taikoStandard),
        livePPRank && livePPRank.taiko.standard
      ),
      relax: createRulesetData(
        results.find(i => i.mode === BanchoPyMode.taikoRelax),
        ranks.find(i => i.mode === BanchoPyMode.taikoRelax),
        livePPRank && livePPRank.taiko.relax
      )
    },
    fruits: {
      standard: createRulesetData(
        results.find(i => i.mode === BanchoPyMode.fruitsStandard),
        ranks.find(i => i.mode === BanchoPyMode.fruitsStandard),
        livePPRank && livePPRank.fruits.standard
      ),
      relax: createRulesetData(
        results.find(i => i.mode === BanchoPyMode.fruitsRelax),
        ranks.find(i => i.mode === BanchoPyMode.fruitsRelax),
        livePPRank && livePPRank.fruits.relax
      )
    },
    mania: {
      standard: createRulesetData(
        results.find(i => i.mode === BanchoPyMode.maniaStandard),
        ranks.find(i => i.mode === BanchoPyMode.maniaStandard),
        livePPRank && livePPRank.mania.standard
      )
    }
  }
  return statistics
}

const getRelationShip = async (fromUser: {id: Id}, toUser: {id: Id}) => {
  const relationships = await prismaClient.relationship.findMany({
    where: {
      fromUserId: fromUser.id,
      toUserId: toUser.id
    },
    select: {
      type: true
    }
  })
  return relationships.map(rel => rel.type)
}

export const getFullUser = async <HasSecrets extends boolean>(
  handle: string | Id,
  secrets: HasSecrets
): Promise<User<Id, HasSecrets> | null> => {
  const user = await prismaClient.user.findFirst({
    ...createUserQuery(handle),
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

  if (!user) {
    return null
  }
  try {
    const reduceUserRelationships = user.relations.reduce((acc, cur) => {
      if (!acc.has(cur.toUserId)) {
        acc.set(cur.toUserId, {
          ...toBaseUser(cur.toUser),
          relationship: [cur.type],
          reverseRelationship: [],
          mutualRelationship: []
        })
      } else {
        acc.get(cur.toUserId)?.relationship.push(cur.type)
      }
      return acc
    }, new Map<Id, UserRelationship<Id>>())

    const dedupedUserRelationships = [...reduceUserRelationships.values()]

    const rel: Record<Relationship, Record<string, PassiveRelationship>> = {
      friend: {
        mutual: 'mutual-friend',
        reverse: 'friend'
      },
      block: {
        mutual: 'mutual-blocked',
        reverse: 'blocked'
      }
    }
    for (const _user of dedupedUserRelationships) {
      const reverse = await getRelationShip(_user, user)
      // console.log({
      //   from: user.id,
      //   to: _user.id,
      //   fromRel: _user.relationship,
      //   reverseRel: reverse
      // })
      for (const [mutualRelationship, { mutual, reverse: reverseType }] of Object.entries(rel)) {
        if (reverse.includes(mutualRelationship as Relationship)) {
          _user.reverseRelationship.push(reverseType)
          if (_user.relationship.includes(mutualRelationship as Relationship)) { _user.mutualRelationship.push(mutual) }
        }
      }
    }

    const returnValue: User<Id, false> = {
      id: user.id,
      ingameId: user.id,
      name: user.name,
      safeName: user.safeName,
      email: user.email,
      flag: user.country,
      avatarUrl: `https://a.ppy.sb/${user.id}`,
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
      profile: (user.userpageContent && JSON.parse(user.userpageContent)) || {
        type: 'doc',
        content: []
      },
      relationships: dedupedUserRelationships
    }

    if (secrets === true) {
      const _returnValue = {
        ...returnValue,
        secrets: {
          password: user.pwBcrypt,
          apiKey: user.apiKey
        }
      } as User<Id, true>
      return _returnValue
    } else {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      return returnValue
    }
  } catch (err) {
    console.error(err)
    return null
  }
}
