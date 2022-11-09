import { Mode, RankingSystem, Ruleset, ServerConfig } from '~/types/common'

type AppConfigItemBase = {
  name: string,
  icon: string,
}

const _serverModeConfig: Record<
    Mode,
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
    Ruleset,
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

export const _serverRankingSystemConfig: Partial<Record<
    RankingSystem,
    AppConfigItemBase & {
      userpage: {
        show: 'tab' | 'dropdown'
      }
    }
  >> = {
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

export type AvailableRankingSystems = keyof typeof _serverRankingSystemConfig
export const serverModeConfig = _serverModeConfig
export const serverRulesetConfig = _serverRulesetConfig
export const serverRankingSystemConfig = _serverRankingSystemConfig as ServerConfig<AvailableRankingSystems>
export type IdType = number
