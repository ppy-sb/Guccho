export const relationship = ['friend', 'block'] as const
export const mutualRelationship = ['mutual-friend', 'mutual-block'] as const
export const scopes = ['self', 'friends', 'public', 'blocked'] as const
export const grades = [
  'f',
  'd',
  'c',
  'b',
  'a',
  's',
  'sh',
  'ss',
  'ssh',
] as const

export const ppRankingSystem = ['ppv2', 'ppv1'] as const
export const scoreRankingSystem = ['score'] as const
export const rankingSystem = [
  ...ppRankingSystem,
  ...scoreRankingSystem,
] as const

export const overallLeaderboardPPRankingSystem = ppRankingSystem
export const overallLeaderboardScoreRankingSystem = [
  'rankedScore',
  'totalScore',
] as const
export const overallLeaderboardRankingSystem = [
  ...ppRankingSystem,
  ...overallLeaderboardScoreRankingSystem,
] as const

export const mode = ['osu', 'taiko', 'fruits', 'mania'] as const
export const ruleset = ['standard', 'relax', 'autopilot'] as const

export const standardAvailable = mode
export const relaxAvailable = ['osu', 'taiko', 'fruits'] as const
export const autopilotAvailable = ['osu'] as const

export const features = ['userpage', 'visibility-scope'] as const
