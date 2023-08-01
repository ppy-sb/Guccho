import { Lang } from '../def'
import enGB from './en-GB'
import zhCN from './zh-CN'

export default {
  [Lang.enGB]: enGB,
  [Lang.zhCN]: zhCN,
} as const
