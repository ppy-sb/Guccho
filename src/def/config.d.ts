import type { KFooter } from '../locales/@types'
import type {
  LeaderboardRankingSystem,
} from './common'
import { type Lang } from '~/def'
import type { ActiveBackendConfig } from '~/server/env'

export interface RankConf {
  userpage: {
    show: 'tab' | 'dropdown'
  }
}

export interface R extends Record<LeaderboardRankingSystem, RankConf> {}

interface Link {
  link: string
}

export type Locale = {
  localeKey: string
  name?: string
} | {
  name: string
}

export type FooterLink = Locale & Link

export type IconLink = Locale & Link & {
  icon: string
}

export interface UIConfig {
  legacyOption?: {
    name: string
  }
  brand?: {
    icon: string
    iconClass?: string | string[] | Record<string, string>
  }
  baseUrl: string
  leaderboardRankingSystem: R
  iconLinks?: IconLink[]
  footerLink?: Partial<Record<KFooter, FooterLink[]>>
  i18n?: {
    messages: Partial<Record<Lang, Record<string, any>>>
  }
}

export interface Use {
  backend: string
}

export type UserBackendConfig = ActiveBackendConfig & {
  use: string
}
