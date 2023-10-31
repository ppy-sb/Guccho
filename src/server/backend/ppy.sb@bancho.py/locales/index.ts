import enGB from './en-GB'
import zhCN from './zh-CN'
import frFR from './fr-FR'
import { Lang } from '~/def'

export const locales = {
  [Lang.enGB]: enGB,
  [Lang.frFR]: frFR,
  [Lang.zhCN]: zhCN,
} as const
