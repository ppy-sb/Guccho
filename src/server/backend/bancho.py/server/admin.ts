import type { Id } from '..'
import { BanchoPyPrivilege } from '../enums'
import { config } from '../env'
import { fromCountryCode, toBanchoPyPriv, toOneBanchoPyPriv, toSafeName, toUserCompact, toUserOptional } from '../transforms'
import { getPrismaClient } from './source/prisma'
import type { UserCompact, UserOptional } from '~/def/user'
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
              in: query.roles.reduce((acc, cur) => acc.and(toOneBanchoPyPriv(cur)), all),
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
      ...toUserCompact(user, this.config),
      ...toUserOptional(user),
      lastActivityAt: new Date(user.lastActivity * 1000),
      registeredAt: new Date(user.creationTime * 1000),
      clan: user.clan
        ? {
            id: user.clan.id,
            name: user.clan.name,
          }
        : undefined,
    }))

    return uCompacts
  }

  async userDetail(query: { id: Id }): Promise<UserCompact<Id> & UserOptional> {
    const user = await this.db.user.findFirstOrThrow({
      where: {
        id: query.id,
      },
    })

    return {
      ...toUserCompact(user, this.config),
      ...toUserOptional(user),
    }
  }

  async updateUserDetail(query: { id: Id }, updateFields: Partial<UserCompact<Id> & UserOptional>): Promise<UserCompact<Id> & UserOptional> {
    const user = await this.db.user.update({
      where: {
        id: query.id,
      },
      data: {
        id: updateFields.id,
        name: updateFields.name,
        safeName: updateFields.name ? toSafeName(updateFields.name) : undefined,
        email: updateFields.email,
        country: updateFields.flag ? fromCountryCode(updateFields.flag) : undefined,
        priv: updateFields.roles ? toBanchoPyPriv(updateFields.roles) : undefined,
      },
    })

    return {
      ...toUserCompact(user, this.config),
      ...toUserOptional(user),
    }
  }
}
