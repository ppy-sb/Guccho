import { ServerConfig } from '~~/src/types/common'

export const _ServerRulesetConfig = {
  ppv2: {
    userpage: {
      show: 'tab'
    },
    name: 'Performance(v2)'
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
    name: 'Ranked Score'
  },
  totalScore: {
    userpage: {
      show: 'tab'
    },
    name: 'Total Score'
  }
}
export type AvailableRankingSystems = keyof typeof _ServerRulesetConfig
export const ServerRulesetConfig = _ServerRulesetConfig as ServerConfig<AvailableRankingSystems>
export type IdType = number
