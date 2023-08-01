import { Mode, Rank, Ruleset } from '~/def'

export const mode = {
  [Mode.Osu]: {
    icon: 'osu',
  },
  [Mode.Taiko]: {
    icon: 'taiko',
  },
  [Mode.Fruits]: {
    icon: 'fruits',
  },
  [Mode.Mania]: {
    icon: 'mania',
  },
} as const

export const ruleset = {
  [Ruleset.Standard]: {
    icon: 'vn',
  },
  [Ruleset.Relax]: {
    icon: 'relax',
  },
  [Ruleset.Autopilot]: {
    icon: 'autopilot',
  },
} as const
export const rankingSystem = {
  [Rank.PPv2]: {
    icon: 'pp',
  },
  [Rank.PPv1]: {
    icon: 'pp',
  },
  [Rank.RankedScore]: {
    icon: 'score',
  },
  [Rank.TotalScore]: {
    icon: 'score',
  },
  [Rank.Score]: {
    icon: 'score',
  },
} as const
