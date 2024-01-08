import type {
  Clan,
  User as DatabaseUser,
} from 'prisma-client-bancho-py'
import type { Id } from '..'
import { Access, BanchoPyUserStatus as B, BanchoPyPrivilege } from '../enums'
import { fromBanchoPyMode } from './mode'
import {
  UserStatus as G,
  Scope,
  type UserClan,
  type UserCompact,
  type UserOptional,
  UserRole,
  type UserSecrets,
  UserStatus,
} from '~/def/user'
import type { ArticleProvider } from '$base/server'
import type { Relationship } from '~/def'
import type { CountryCode } from '~/def/country-code'
import type { UserRelationship } from '~/def/user-relationship'

export function toRoles(priv: number): UserRole[] {
  const roles: UserRole[] = []

  if ((priv & BanchoPyPrivilege.Normal) !== BanchoPyPrivilege.Normal) {
    roles.push(UserRole.Restricted)
  }
  else if (priv & (BanchoPyPrivilege.Verified | BanchoPyPrivilege.Normal)) {
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
    case UserRole.Restricted:
      return BanchoPyPrivilege.Any
    // case UserRole.Registered:
    //   return BanchoPyPrivilege.Normal
    case UserRole.Normal:
      return BanchoPyPrivilege.Verified | BanchoPyPrivilege.Normal
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

export function toUserClan(user: Pick<DatabaseUser & { clan: Pick<Clan, 'id' | 'name'> | null }, 'name' | 'clan'>) {
  return {
    clan: user.clan
      ? {
          name: user.clan?.name,
          id: user.clan.id,
        } as UserClan<Id>
      : null,
  }
}

export type DatabaseUserCompactFields = 'id' | 'name' | 'safeName' | 'country' | 'priv'
export function toUserCompact(user: Pick<DatabaseUser, DatabaseUserCompactFields>, { avatar }: {
  avatar: {
    domain: string
  }
}): UserCompact<Id> {
  return {
    id: user.id,
    stableClientId: user.id,
    name: user.name,
    safeName: user.safeName,
    flag: user.country.toUpperCase() as CountryCode,
    avatarSrc: avatar.domain && toUserAvatarSrc(
      user,
      { avatar }
    ),
    roles: toRoles(user.priv),
  } satisfies UserCompact<Id>
}

export function toUserAvatarSrc(user: { id: Id }, config: { avatar: { domain: string } }) {
  return `https://${config.avatar.domain}/${user.id}`
}

export type DatabaseUserOptionalFields = 'email' | 'preferredMode'
export function toUserOptional(user: Pick<DatabaseUser, DatabaseUserOptionalFields>): UserOptional {
  const [mode, ruleset] = fromBanchoPyMode(user.preferredMode)
  return {
    email: user.email,
    preferredMode: {
      mode,
      ruleset,
    },
    status: UserStatus.Unknown,
  } satisfies UserOptional
}

export type DatabaseUserSecretsFields = 'pwBcrypt'
export function toUserSecrets(user: Pick<DatabaseUser, DatabaseUserSecretsFields>): UserSecrets {
  return {
    password: user.pwBcrypt,
  }
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
    stableClientId: user.id,
    name: user.name,
    safeName: user.safeName,
    flag: user.country.toUpperCase() as CountryCode,
    avatarSrc: config.avatar.domain && toUserAvatarSrc(
      user,
      // @ts-expect-error you are dumb
      config
    ),
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
