import type { DeepPartial } from '@trpc/server'
import type { GlobalI18n } from '~/locales/@types'

export default {
  landing: {
    content: `这里是一个面向全模式的osu!私服。有则最先进的RX、AP算法，同时为全模式提供PP计算支持。拥有全图排行榜,以及无限次数的改名机会。
- 如果有更多疑问，可以访问gulag和Guccho的Github仓库。
- 我们的项目完全开源!`,
  },
  service: {
  },
} as const satisfies DeepPartial<GlobalI18n>
