//  privileges intended for all normal players.
export enum BanchoPyPrivilege {
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
  osuStandard = 0,
  taikoStandard = 1,
  fruitsStandard = 2,
  maniaStandard = 3,

  osuRelax = 4,
  taikoRelax = 5,
  fruitsRelax = 6,
  // maniaRelax = 7,

  osuAutopilot = 8,
  // taikoAutopilot = 9,
  // fruitsAutopilot = 10,
  // maniaAutopilot = 11,
}

export enum BanchoPyScoreStatus {
  Best = 2,
}

export enum BanchoPyRankedStatus {
  NotSubmitted = -1,
  Pending = 0,
  UpdateAvailable = 1,
  Ranked = 2,
  Approved = 3,
  Qualified = 4,
  Loved = 5,
}
