import type { Id } from '..'
import { toOneBanchoPyPriv, toUserCompact } from '../transforms'
import { config } from '../env'
import { BanchoPyPrivilege } from '../enums'
import { UserStatus } from './../../../../def/user'
import { getPrismaClient } from './source/prisma'
import { Scope, type UserCompact, type UserOptional } from '~/def/user'

import { AdminProvider as Base } from '$base/server'

const all = ExpandedBitwiseEnumArray.fromTSBitwiseEnum(BanchoPyPrivilege)

export class AdminProvider extends Base<Id> implements Base<Id> {
  db = getPrismaClient()
  config = config()
  async userList(query: Partial<UserCompact<Id> & Pick<UserOptional, 'email' | 'status'>> & {
    page: number
    perPage: number
  }) {
    const result = await this.db.user.findMany({
      where: {
        id: query.id,
        name: query.name,
        safeName: query.safeName,
        email: query.email,
        country: query.flag,
        priv: query.roles?.length
          ? {
              in:  query.roles.reduce((acc, cur) => acc.and(toOneBanchoPyPriv(cur)), all),
            }
          : undefined,
      },
      include: {
        clan: true,
      },
      orderBy: {
        lastActivity: 'desc',
      },
      skip: query.page * query.perPage,
      take: query.perPage,
    })
    const uCompacts = result.map(user => ({
      ...toUserCompact(user, {
        includes: {
          email: true,
        },
        avatar: this.config.avatar,
      }, Scope.Self),
      status: UserStatus.Unknown,
      lastActivityAt: new Date(user.lastActivity * 1000),
      registeredAt: new Date(user.creationTime * 1000),
      clan: {
        id: user.clan.id,
        name: user.clan.name,
      },
    }))

    return uCompacts
  }
}
