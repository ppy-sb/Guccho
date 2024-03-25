import type { VueMessageType } from '@nuxtjs/i18n/dist/runtime/composables'
import type { DeepPartial } from '@trpc/server'
import type { CountryCode } from '../def/country-code'
import type { GucchoError } from '../server/trpc/messages'
import type { Scope, UserRole } from '~/def/user'
import { Lang, type Rank } from '~/def'
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
| 'clans'

type KGlobal =
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
| 'wip'

type KFooter =
| 'about'
| 'resources'

export interface GlobalI18n extends PathAccessibleObject {
  server: {
    name: string
  }
  footer: Record<KFooter, string>

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

  error: Record<GucchoError, string>

  country: Record<CountryCode, string>
}

interface T { [x: string]: localeMessages<VueMessageType> }
export interface AllLocales extends T {
  [lang in Lang]: lang extends Lang.enGB ? GlobalI18n : DeepPartial<GlobalI18n>
}
