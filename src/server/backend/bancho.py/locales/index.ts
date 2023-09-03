import enGB from './en-GB'
import frFR from './fr-FR'
import zhCN from './zh-CN'
import { Lang } from '~/def'

export const locales = {
  [Lang.enGB]: enGB,
  [Lang.frFR]: frFR,
  [Lang.zhCN]: zhCN,
} as const
