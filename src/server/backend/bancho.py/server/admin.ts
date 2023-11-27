import { TRPCError } from '@trpc/server'
import { Prisma } from 'prisma-client-bancho-py'
import type { Id } from '..'
import { BanchoPyPrivilege } from '../enums'
import { config } from '../env'
import { fromCountryCode, toBanchoPyPriv, toOneBanchoPyPriv, toSafeName, toUserCompact, toUserOptional } from '../transforms'
import { encryptBanchoPassword } from '../crypto'
import { getPrismaClient } from './source/prisma'
import { type UserClan, type UserCompact, type UserOptional, type UserSecrets } from '~/def/user'
import { AdminProvider as Base } from '$base/server'

const all = ExpandedBitwiseEnumArray.fromTSBitwiseEnum(BanchoPyPrivilege)

export class AdminProvider extends Base<Id> implements Base<Id> {
  db = getPrismaClient()
  config = config()
  async userList(query: Partial<UserCompact<Id> & Pick<UserOptional, 'email' | 'status'>> & Partial<UserSecrets> & {
    page: number
    perPage: number
  }) {
    const cond = {
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
    } as const

    const [result, count] = await this.db.$transaction([
      this.db.user.findMany({
        where: cond,
        include: {
          clan: true,
        },
        orderBy: {
          lastActivity: 'desc',
        },
        skip: query.page * query.perPage,
        take: query.perPage,
      }),
      this.db.user.count({ where: cond }),
    ])

    const uCompacts = result.map(user => ({
      ...toUserCompact(user, this.config),
      ...toUserOptional(user),
      lastActivityAt: new Date(user.lastActivity * 1000),
      registeredAt: new Date(user.creationTime * 1000),
      clan: user.clan
        ? {
          id: user.clan.id,
          name: user.clan.name,
          badge: user.clan.tag,
        } satisfies UserClan<Id>
        : undefined,
    })) satisfies Array<UserCompact<Id> & Pick<UserOptional, 'email' | 'status'> & {
      registeredAt: Date
      lastActivityAt: Date
      clan?: UserClan<Id>
    }>

    return [count, uCompacts] as const
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

  async updateUserDetail(query: { id: Id }, updateFields: Partial<UserCompact<Id> & UserOptional & UserSecrets>): Promise<UserCompact<Id> & UserOptional> {
    try {
      const user = await this.db.user.update({
        where: {
          id: query.id,
        },
        data: {
          id: updateFields.id,
          name: updateFields.name,
          safeName: updateFields.name ? toSafeName(updateFields.name) : undefined,
          pwBcrypt: updateFields.password ? await encryptBanchoPassword(updateFields.password) : undefined,
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
    catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        throw new TRPCError({
          message: e.code + e.message,
          code: 'CONFLICT',
        })
      }
      throw e
    }
  }
}
