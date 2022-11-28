import type { Mode as _Mode, Ruleset as _Ruleset } from '~/types/common'
import { ServerConfig } from '~/types/common'

export type IdType = number

interface AppConfigItemBase {
  name: string
  icon: string
}

export const serverModeConfig: Record<
_Mode,
AppConfigItemBase
> = {
  osu: {
    name: 'Osu',
    icon: 'osu',
  },
  taiko: {
    name: 'Taiko',
    icon: 'taiko',
  },
  fruits: {
    name: 'CTB',
    icon: 'catch',
  },
  mania: {
    name: 'Mania',
    icon: 'mania',
  },
}
export const serverRulesetConfig: Record<
_Ruleset,
AppConfigItemBase
> = {
  standard: {
    name: 'Standard',
    icon: 'vn',
  },
  relax: {
    name: 'Relax',
    icon: 'relax',
  },
  autopilot: {
    name: 'Autopilot',
    icon: 'autopilot',
  },
}

const _serverRankingSystemConfig = {
  ppv2: {
    userpage: {
      show: 'tab',
    },
    name: 'Performance(v2)',
    // icon: 'pp'
  },
  // ppv1: {
  //   userpage: {
  //     show: 'dropdown'
  //   },
  //   name: 'Performance(v1)'
  // },
  rankedScore: {
    userpage: {
      show: 'tab',
    },
    name: 'Ranked Score',
    // icon: 'score'
  },
  totalScore: {
    userpage: {
      show: 'tab',
    },
    name: 'Total Score',
    // icon: 'score'
  },
} as const

export type Mode = keyof typeof serverModeConfig
export type Ruleset = keyof typeof serverRulesetConfig
export type RankingSystem = keyof typeof _serverRankingSystemConfig

export const serverRankingSystemConfig = _serverRankingSystemConfig satisfies ServerConfig<RankingSystem>
