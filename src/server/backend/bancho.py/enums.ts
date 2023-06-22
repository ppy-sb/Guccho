import type { ArticleProvider } from '../$base/server'
import { UserPrivilege } from '~/types/user'
import { Mode, Scope } from '~/types/defs'

//  privileges intended for all normal players.
export const enum BanchoPyPrivilege {
  Any = 0,
  Normal = 1 << 0, //  is an unbanned player.
  Verified = 1 << 1, //  has logged in to the server in-game.

  // has bypass to low-ceiling anticheat measures (trusted).
  Whitelisted = 1 << 2,

  // donation tiers, receives some extra benefits.
  Supporter = 1 << 4,
  Premium = 1 << 5,

  // notable users, receives some extra benefits.
  Alumni = 1 << 7,

  // staff permissions, able to manage server state.
  Tournament = 1 << 10, //  able to manage match state without host.
  Nominator = 1 << 11, //  able to manage maps ranked status.
  Mod = 1 << 12, //  able to manage users (level 1).
  Admin = 1 << 13, //  able to manage users (level 2).
  Dangerous = 1 << 14, //  able to manage full server state.

  // Guccho custom
  Bot = 1 << 15,

  Donator = Supporter | Premium,
  Staff = Mod | Admin | Dangerous,
}

export enum BanchoPyMode {
  OsuStandard = 0,
  TaikoStandard = 1,
  FruitsStandard = 2,
  ManiaStandard = 3,

  OsuRelax = 4,
  TaikoRelax = 5,
  FruitsRelax = 6,
  // maniaRelax = 7,

  OsuAutopilot = 8,
  // taikoAutopilot = 9,
  // fruitsAutopilot = 10,
  // maniaAutopilot = 11,
}

export const enum BanchoPyScoreStatus {
  DNF, // Failed in bancho.py
  Normal, // Submitted in bancho.py
  Pick, // Bests in banco.py
}

export const enum BanchoPyRankedStatus {
  NotSubmitted = -1,
  Pending,
  UpdateAvailable,
  Ranked,
  Approved,
  Qualified,
  Loved,
}

export const enum BanchoMode {
  Osu,
  Taiko,
  Fruits,
  Mania,
}

export const enum Access {
  Public = 1 << 1,
  Moderator = 1 << 2,
  BeatmapNominator = 1 << 3,
  Staff = 1 << 4,
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

export function toBanchoMode(mode: Mode) {
  switch (mode) {
    case Mode.Osu: return BanchoMode.Osu
    case Mode.Taiko: return BanchoMode.Taiko
    case Mode.Fruits: return BanchoMode.Fruits
    case Mode.Mania: return BanchoMode.Mania
  }
}
export function fromBanchoMode(mode: BanchoMode) {
  switch (mode) {
    case BanchoMode.Osu: return Mode.Osu
    case BanchoMode.Taiko: return Mode.Taiko
    case BanchoMode.Fruits: return Mode.Fruits
    case BanchoMode.Mania: return Mode.Mania
  }
}
