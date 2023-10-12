import type {
  User as DatabaseUser,
} from 'prisma-client-bancho-py'
import { Access, BanchoPyUserStatus as B, BanchoPyPrivilege } from '../enums'
import type { Id } from '..'
import type { ArticleProvider } from '$base/server'
import type {
  UserCompact,
  UserOptional,
  UserSecrets,
} from '~/def/user'
import {
  UserStatus as G,
  Scope,
  UserRole,
} from '~/def/user'
import type { Relationship } from '~/def'

import type { UserRelationship } from '~/def/user-relationship'
import type { CountryCode } from '~/def/country-code'

export function toRoles(priv: number): UserRole[] {
  const roles: UserRole[] = []
  // if (priv & BanchoPyPrivilege.Normal) {
  //   roles.push(UserRole.Registered)
  // }

  if (priv & BanchoPyPrivilege.Verified) {
    roles.push(UserRole.Normal)
  }

  if (priv & BanchoPyPrivilege.Whitelisted) {
    roles.push(UserRole.Verified)
  }

  if (priv & BanchoPyPrivilege.Donator) {
    roles.push(UserRole.Supporter)
  }

  if (priv & BanchoPyPrivilege.Alumni) {
    roles.push(UserRole.Alumni)
  }

  if (priv & BanchoPyPrivilege.Tournament) {
    roles.push(UserRole.TournamentStaff)
  }

  if (priv & BanchoPyPrivilege.Nominator) {
    roles.push(UserRole.BeatmapNominator)
  }

  if (priv & BanchoPyPrivilege.Mod) {
    roles.push(UserRole.Moderator)
  }

  if (priv & BanchoPyPrivilege.Staff) {
    roles.push(UserRole.Staff)
  }

  if (priv & BanchoPyPrivilege.Admin) {
    roles.push(UserRole.Admin)
  }

  if (priv & BanchoPyPrivilege.Dangerous) {
    roles.push(UserRole.Owner)
  }

  if (priv & BanchoPyPrivilege.Bot) {
    roles.push(UserRole.Bot)
  }

  return roles
}

export function toBanchoPyPriv(input: UserRole[]): number {
  let curr = 0
  for (const role of input) {
    curr |= toOneBanchoPyPriv(role)
  }
  return curr
}

export function toOneBanchoPyPriv(role: UserRole): number {
  switch (role) {
    // case UserRole.Registered:
    //   return BanchoPyPrivilege.Normal
    case UserRole.Normal:
      return BanchoPyPrivilege.Verified
    case UserRole.Verified:
      return BanchoPyPrivilege.Whitelisted
    case UserRole.Supporter:
      return BanchoPyPrivilege.Donator
    case UserRole.Alumni:
      return BanchoPyPrivilege.Alumni
    case UserRole.TournamentStaff:
      return BanchoPyPrivilege.Tournament
    case UserRole.BeatmapNominator:
      return BanchoPyPrivilege.Nominator
    case UserRole.Moderator:
      return BanchoPyPrivilege.Mod
    case UserRole.Staff:
      return BanchoPyPrivilege.Staff
    case UserRole.Admin:
      return BanchoPyPrivilege.Admin
    case UserRole.Owner:
      return BanchoPyPrivilege.Dangerous
    case UserRole.Bot:
      return BanchoPyPrivilege.Bot
    default:
      return 0
  }
}

export type DatabaseUserCompactFields = 'id' | 'name' | 'safeName' | 'country' | 'priv' | 'pwBcrypt' | 'email'
export function toUserCompact<
  _Scope extends Scope = Scope.Public,
  Includes extends Partial<Record<keyof UserOptional, boolean>> = Record<never, never>,
>(user: Pick<DatabaseUser, DatabaseUserCompactFields>, { includes, avatar }: {
  includes?: Includes
  avatar: {
    domain?: string
  }
}, scope?: _Scope) {
  if (scope === undefined) {
    scope = Scope.Public as _Scope
  }
  const returnValue: UserCompact<Id> & Partial<UserOptional> & Partial<UserSecrets> = {
    id: user.id,
    ingameId: user.id,
    name: user.name,
    safeName: user.safeName,
    flag: toCountryCode(user.country),
    avatarSrc: avatar.domain && `https://${avatar.domain}/${user.id}`,
    roles: toRoles(user.priv),
  }

  if (scope === Scope.Self) {
    returnValue.password = user.pwBcrypt
  }

  if (includes?.email) {
    returnValue.email = user.email
  }

  return returnValue as (
    UserCompact<Id>
    & (_Scope extends Scope.Self ? UserSecrets : Record<never, never>)
    & (Includes['email'] extends true ? { email: string } : Record<never, never>)
  )
}

export function dedupeUserRelationship(
  relations: Array<{
    type: Relationship
    toUserId: Id
    toUser: UserCompact<Id>
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
  }, new Map<Id, UserCompact<Id> & UserRelationship>())

  return [...reduceUserRelationships.values()]
}

export function toFullUser(
  user: DatabaseUser,
  config: {
    avatar: {
      domain?: string
    }
  },
): UserCompact<Id> {
  return {
    id: user.id,
    ingameId: user.id,
    name: user.name,
    safeName: user.safeName,
    flag: toCountryCode(user.country),
    avatarSrc: config.avatar.domain && `https://${config.avatar.domain}/${user.id}`,
    roles: toRoles(user.priv),
  }
}

export function toSafeName(name: string) {
  return name.toLocaleLowerCase().replaceAll(' ', '_')
}

export function toBanchoPyAccess(priv: (ArticleProvider.TReadAccess | ArticleProvider.TWriteAccess)[]): Access {
  let carry = 0
  if (priv.includes(Scope.Public)) {
    carry &= Access.Public
  }
  if (priv.includes(UserRole.Moderator)) {
    carry &= Access.Moderator
  }
  if (priv.includes(UserRole.BeatmapNominator)) {
    carry &= Access.BeatmapNominator
  }
  if (priv.includes(UserRole.Staff)) {
    carry &= Access.Staff
  }
  return carry
}
export const BPyStatus = {
  [B.Idle]: G.Idle,
  [B.Afk]: G.Afk,
  [B.Playing]: G.Playing,
  [B.Editing]: G.Editing,
  [B.Modding]: G.Modding,
  [B.Multiplayer]: G.MatchLobby,
  [B.Watching]: G.Watching,
  [B.Unknown]: G.Unknown,
  [B.Testing]: G.Testing,
  [B.Submitting]: G.Submitting,
  [B.Paused]: G.Paused,
  [B.Lobby]: G.Lobby,
  [B.Multiplaying]: G.MatchOngoing,
  [B.OsuDirect]: G.OsuDirect,
} as const

export function fromBanchoPyUserStatus<T extends B>(input: T) {
  return BPyStatus[input] ?? G.Unknown
}

export function fromCountryCode(code: CountryCode): string {
  return code.toLowerCase()
}
