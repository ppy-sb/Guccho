import type { PublicRuntimeConfig } from 'nuxt/schema'
import type {
  LeaderboardRankingSystem,
} from './common'

import type { ActiveBackendConfig } from '~/server/env'

export interface RankConf {
  userpage: {
    show: 'tab' | 'dropdown'
  }
}

export interface R extends Record<LeaderboardRankingSystem, RankConf> {}
export interface IconLink {
  icon: string
  link: string
  name: string
}

export interface UIConfig {
  baseUrl: string
  version: string
  leaderboardRankingSystem: R
  links?: IconLink[]
}

export interface Use {
  backend: string
}

export type UserBackendConfig = ActiveBackendConfig & {
  use: string
}
