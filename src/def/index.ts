export enum LogLevel {
  unknown = -1,
  error = 0,
  warn = 1,
  info = 2,
  http = 3,
  verbose = 4,
  debug = 5,
  silly = 6,
}

export enum Lang {
  enGB = 'en-GB',
  zhCN = 'zh-CN',
  frFR = 'fr-FR',
  deDE = 'de-DE',
}

export enum Relationship {
  Friend,
  Blocked,
}
export enum MutualRelationship {
  MutualFriend,
  MutualBlocked,
}

export enum Rank {
  PPv1 = 'ppv1',
  PPv2 = 'ppv2',
  Score = 'score',
  RankedScore = 'rankedScore',
  TotalScore = 'totalScore',
}

export const PPRank = {
  PPv1: Rank.PPv1,
  PPv2: Rank.PPv2,
} as const

export const ScoreRank = {
  Score: Rank.Score,
} as const

export const LeaderboardScoreRank = {
  RankedScore: Rank.RankedScore,
  TotalScore: Rank.TotalScore,
} as const

export enum Mode {
  Osu = 'osu',
  Taiko = 'taiko',
  Fruits = 'fruits',
  Mania = 'mania',
}

export enum Ruleset {
  Standard = 'standard',
  Relax = 'relax',
  Autopilot = 'autopilot',
}
