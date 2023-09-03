import { Lang } from '../def'
import enGB from './en-GB'
import frFR from './fr-FR'
import zhCN from './zh-CN'

export default {
  [Lang.enGB]: enGB,
  [Lang.frFR]: frFR,
  [Lang.zhCN]: zhCN,
} as const
