import type {
  User as DatabaseUser,
} from 'prisma-client-bancho-py'
import { Access, BanchoPyUserStatus as B, BanchoPyPrivilege } from '../enums'
import type { Id } from '..'
import type { ArticleProvider } from '$base/server'
import type {
  UserEssential,
  UserExtra,
  UserOptional,
  UserSecrets,
} from '~/def/user'
import {
  UserStatus as G,
  Scope,
  UserPrivilege,
} from '~/def/user'
import type { Relationship } from '~/def'

import type { UserRelationship } from '~/def/user-relationship'

export function toRoles(priv: number): UserPrivilege[] {
  const roles: UserPrivilege[] = []
  if (priv & BanchoPyPrivilege.Normal) {
    roles.push(UserPrivilege.Registered)
  }

  if (priv & BanchoPyPrivilege.Verified) {
    roles.push(UserPrivilege.Normal)
  }

  if (priv & BanchoPyPrivilege.Whitelisted) {
    roles.push(UserPrivilege.Whitelisted)
  }

  if (priv & BanchoPyPrivilege.Donator) {
    roles.push(UserPrivilege.Supporter)
  }

  if (priv & BanchoPyPrivilege.Alumni) {
    roles.push(UserPrivilege.Alumni)
  }

  if (priv & BanchoPyPrivilege.Tournament) {
    roles.push(UserPrivilege.TournamentStuff)
  }

  if (priv & BanchoPyPrivilege.Nominator) {
    roles.push(UserPrivilege.BeatmapNominator)
  }

  if (priv & BanchoPyPrivilege.Mod) {
    roles.push(UserPrivilege.Moderator)
  }

  if (priv & BanchoPyPrivilege.Staff) {
    roles.push(UserPrivilege.Staff)
  }

  if (priv & BanchoPyPrivilege.Admin) {
    roles.push(UserPrivilege.Admin)
  }

  if (priv & BanchoPyPrivilege.Dangerous) {
    roles.push(UserPrivilege.Owner)
  }

  if (priv & BanchoPyPrivilege.Bot) {
    roles.push(UserPrivilege.Bot)
  }

  return roles
}

export type DatabaseUserEssentialFields = 'id' | 'name' | 'safeName' | 'country' | 'priv' | 'pwBcrypt' | 'apiKey' | 'email'
export function toUserEssential<
  Includes extends Partial<Record<keyof UserOptional, boolean>> = Record<never, never>,
>(user: Pick<DatabaseUser, DatabaseUserEssentialFields>, { includes, avatar }: {
  includes?: Includes
  avatar: {
    domain?: string
  }
}) {
  const returnValue: UserEssential<Id> & Partial<UserOptional> = {
    id: user.id,
    ingameId: user.id,
    name: user.name,
    safeName: user.safeName,
    flag: user.country,
    avatarSrc: avatar.domain && `https://${avatar.domain}/${user.id}`,
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
    type: Relationship
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
  }, new Map<Id, UserEssential<Id> & UserRelationship>())

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
    avatarSrc: config.avatar.domain && `https://${config.avatar.domain}/${user.id}`,
    roles: toRoles(user.priv),
    settings: {
      accessControl: {
        reachable: { [Scope.Public]: true },
        status: { [Scope.Public]: true },
        privateMessage: { [Scope.Public]: true },
        email: {},
        oldNames: { [Scope.Public]: true },
      } as const,
    },
    oldNames: [],
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
  if (priv.includes(UserPrivilege.Moderator)) {
    carry &= Access.Moderator
  }
  if (priv.includes(UserPrivilege.BeatmapNominator)) {
    carry &= Access.BeatmapNominator
  }
  if (priv.includes(UserPrivilege.Staff)) {
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
