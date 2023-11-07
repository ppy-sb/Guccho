import type { LocaleMessageValue, VueMessageType } from '@nuxtjs/i18n/dist/runtime/composables'
import type { CountryCode } from '../def/country-code'
import type { Scope, UserRole } from '~/def/user'
import type { Rank } from '~/def'
import type { ActiveMode, ActiveRuleset } from '~/def/common'

type Titles =
| 'leaderboard'
| 'status'
| 'settings'
| 'relations'
| 'userpage'
| 'admin-panel'
| 'logs'
| 'articles'

type KGlobal =
| 'server-title'
| 'logout'
| 'login'
| 'register'
| 'pp'
| 'player'
| 'rank'
| 'mods'
| 'played-at'
| 'acc'
| 'accuracy'
| 'play-count'
| 'beatmapsets'
| 'beatmaps'
| 'users'
| 'session'

export interface GlobalI18n extends Record<string, LocaleMessageValue<VueMessageType>> {
  mode: Record<ActiveMode, string>
  ruleset: Record<ActiveRuleset, string>
  rank: Record<Rank, string>
  role: Record<UserRole, string>
  scope: Record<Scope, string>
  titles: Record<
    Titles,
    string
  >
  global: Record<KGlobal, string>

  service: Record<string, string>

  country: Record<CountryCode, string>
}
