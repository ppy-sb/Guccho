import type { Rank } from '~/def'
import type { ActiveMode, ActiveRuleset } from '~/def/common'

export interface GlobalI18n extends Record<string, any> {
  mode: Record<ActiveMode, string>
  ruleset: Record<ActiveRuleset, string>
  rank: Record<Rank, string>
}

export { default as enGB } from './en-GB'
export { default as zhCN } from './zh-CN'
