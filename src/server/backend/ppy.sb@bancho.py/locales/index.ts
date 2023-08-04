import zhCN from './zh-CN'
import enGB from '$base/locales/en-GB'
import { Lang } from '~/def'

export const locales = {
  [Lang.enGB]: enGB,
  [Lang.zhCN]: zhCN,
} as const
