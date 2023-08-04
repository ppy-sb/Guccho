import enGB from './en-GB'
import zhCN from './zh-CN'
import { Lang } from '~/def'

export const locales = {
  [Lang.enGB]: enGB,
  [Lang.zhCN]: zhCN,
} as const
