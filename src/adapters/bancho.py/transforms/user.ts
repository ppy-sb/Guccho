import type {
  User as DatabaseUser, RelationshipType,
} from '.prisma/bancho.py'
import { BanchoPyPrivilege } from '../enums'

import type { Id } from '..'
import type {
  UserEssential,
  UserExtra,
  UserOptional,
  UserPrivilegeString,
  UserSecrets,
} from '~/types/user'
import type { UserRelationship } from '~/types/user-relationship'

export function toRoles(priv: number): UserPrivilegeString[] {
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
export type DatabaseUserEssentialFields = 'id' | 'name' | 'safeName' | 'country' | 'priv' | 'pwBcrypt' | 'apiKey' | 'email'
export function toUserEssential<
  Includes extends Partial<Record<keyof UserOptional<Id>, boolean>> = Record<
    never,
    never
  >,
>({ user, includes, config }: {
  user: Pick<DatabaseUser, DatabaseUserEssentialFields>
  includes?: Includes
  config: {
    avatar: {
      domain?: string
    }
  }
}) {
  const returnValue: UserEssential<Id> & Partial<UserOptional<Id>> = {
    id: user.id,
    ingameId: user.id,
    name: user.name,
    safeName: user.safeName,
    flag: user.country,
    avatarSrc:
      (config.avatar.domain
        && `https://${config.avatar.domain}/${user.id}`)
      || undefined,
    roles: toRoles(user.priv),
  }

  if (includes?.secrets) {
    returnValue.secrets = {
      password: user.pwBcrypt,
      apiKey: user.apiKey || undefined,
    }
  }

  if (includes?.email) {
    returnValue.email = user.email
  }

  return returnValue as Includes['secrets'] extends true
    ? UserEssential<Id> & { secrets: UserSecrets }
    : UserEssential<Id>
}

export function dedupeUserRelationship(
  relations: Array<{
    type: RelationshipType
    toUserId: Id
    toUser: UserEssential<Id>
  }>
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

export function toFullUser(
  user: DatabaseUser,
  config: {
    avatar: {
      domain?: string
    }
  }
): UserEssential<Id> &
  Pick<UserExtra<Id>, 'settings'> &
  Pick<UserOptional, 'oldNames'> {
  return {
    id: user.id,
    ingameId: user.id,
    name: user.name,
    safeName: user.safeName,
    flag: user.country,
    avatarSrc:
      (config.avatar.domain
        && `https://${config.avatar.domain}/${user.id}`)
      || undefined,
    roles: toRoles(user.priv),
    settings: {
      visibility: {
        reachable: { public: true },
        status: { public: true },
        privateMessage: { public: true },
        email: {},
        oldNames: { public: true },
      } as const,
    },
    oldNames: [],
  }
}
