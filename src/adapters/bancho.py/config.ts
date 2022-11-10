import { Mode as _Mode, Ruleset as _Ruleset, ServerConfig } from '~/types/common'

export type IdType = number

type AppConfigItemBase = {
  name: string,
  icon: string,
}

const _serverModeConfig: Record<
    _Mode,
    AppConfigItemBase
  > = {
    osu: {
      name: 'Osu',
      icon: 'osu'
    },
    taiko: {
      name: 'Taiko',
      icon: 'taiko'
    },
    fruits: {
      name: 'CTB',
      icon: 'catch'
    },
    mania: {
      name: 'Mania',
      icon: 'mania'
    }
  }
const _serverRulesetConfig: Record<
    _Ruleset,
    AppConfigItemBase
  > = {
    standard: {
      name: 'Standard',
      icon: 'vn'
    },
    relax: {
      name: 'Relax',
      icon: 'relax'
    },
    autopilot: {
      name: 'Autopilot',
      icon: 'autopilot'
    }
  }

export const _serverRankingSystemConfig = {
  ppv2: {
    userpage: {
      show: 'tab'
    },
    name: 'Performance(v2)',
    icon: 'pp'
  },
  // ppv1: {
  //   userpage: {
  //     show: 'dropdown'
  //   },
  //   name: 'Performance(v1)'
  // },
  rankedScore: {
    userpage: {
      show: 'tab'
    },
    name: 'Ranked Score',
    icon: 'score'
  },
  totalScore: {
    userpage: {
      show: 'tab'
    },
    name: 'Total Score',
    icon: 'score'
  }
}

export type Mode = keyof typeof _serverModeConfig
export type Ruleset = keyof typeof _serverRulesetConfig
export type RankingSystem = keyof typeof _serverRankingSystemConfig

export const serverModeConfig = _serverModeConfig
export const serverRulesetConfig = _serverRulesetConfig
export const serverRankingSystemConfig = _serverRankingSystemConfig as ServerConfig<RankingSystem>
