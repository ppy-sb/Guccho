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
export interface IconLinks {
  icon: string
  link: string
  name: string
}

export interface UIConfig {
  baseUrl: string
  version: string
  leaderboardRankingSystem: R
  links?: IconLinks[]
}

export interface Use {
  backend: string
}

export interface GucchoConfig {
  use: Use
  ui: UIConfig
  backend: ActiveBackendConfig
}

declare module 'nuxt/schema' {
  interface PublicRuntimeConfig extends UIConfig {}
}

// It is always important to ensure you import/export something when augmenting a type
export {}
