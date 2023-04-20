import type {
  LeaderboardPPRankingSystem,
  LeaderboardScoreRankingSystem,
  Mode,
  PPRankingSystem,
  Ruleset,
  ScoreRankingSystem,
} from './common'

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

const basePPRankingSystem = ['ppv2', 'ppv1'] as const
const baseScoreRankingSystem = ['score'] as const

const baseLeaderboardPPRankingSystem = basePPRankingSystem
const baseLeaderboardScoreRankingSystem = [
  'rankedScore',
  'totalScore',
] as const

const defaultConfigure = {
  leaderboardRankingSystem: {
    ppRankingSystem: baseLeaderboardPPRankingSystem,
    scoreRankingSystem: baseLeaderboardScoreRankingSystem,
  },
  rankingSystem: {
    ppRankingSystem: basePPRankingSystem,
    scoreRankingSystem: baseScoreRankingSystem,
  },
}

export const modeRulesetRankingSystemDef = {
  osu: {
    standard: defaultConfigure,
    relax: defaultConfigure,
    autopilot: defaultConfigure,
  },
  taiko: {
    standard: defaultConfigure,
    relax: defaultConfigure,
  },
  fruits: {
    standard: defaultConfigure,
    relax: defaultConfigure,
  },
  mania: {
    standard: defaultConfigure,
  },
} as const

const _mode = new Set<Mode>()
const _ruleset = new Set<Ruleset>()

const _ppRankingSystem = new Set<PPRankingSystem>()
const _scoreRankingSystem = new Set<ScoreRankingSystem>()

const _leaderboardPPRankingSystem = new Set<LeaderboardPPRankingSystem>()
const _leaderboardScoreRankingSystem = new Set<LeaderboardScoreRankingSystem>()

for (const key in modeRulesetRankingSystemDef) {
  _mode.add(key as Mode)
  const ruleset = modeRulesetRankingSystemDef[key as Mode]
  for (const rule in ruleset) {
    _ruleset.add(rule as Ruleset)
    const rankingSystemDefs = ruleset[rule as keyof typeof ruleset]

    rankingSystemDefs.leaderboardRankingSystem.ppRankingSystem.map(rs =>
      _leaderboardPPRankingSystem.add(rs)
    )
    rankingSystemDefs.leaderboardRankingSystem.scoreRankingSystem.map(rs =>
      _leaderboardScoreRankingSystem.add(rs)
    )

    rankingSystemDefs.rankingSystem.ppRankingSystem.map(rs =>
      _ppRankingSystem.add(rs)
    )
    rankingSystemDefs.rankingSystem.scoreRankingSystem.map(rs =>
      _scoreRankingSystem.add(rs)
    )
  }
}

export const modes = [..._mode] as const
export const rulesets = [..._ruleset] as const

export const ppRankingSystems = [..._ppRankingSystem] as const
export const scoreRankingSystems = [..._scoreRankingSystem] as const
export const rankingSystems = [...ppRankingSystems, ...scoreRankingSystems] as const

export const leaderboardPPRankingSystems = [..._leaderboardPPRankingSystem] as const
export const leaderboardScoreRankingSystems = [
  ..._leaderboardScoreRankingSystem,
] as const
export const leaderboardRankingSystems = [
  ...leaderboardPPRankingSystems,
  ...leaderboardScoreRankingSystems,
] as const

export const features = ['userpage', 'visibility-scope'] as const
