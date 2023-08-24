import type { DeepPartial } from '@trpc/server'

import type { GlobalI18n } from '~/locales/@types'

export default {
  landing: {
    content: `We are an osu! private server built from the ground up with many unique features not seen elsewhere!
- for more information, check out bancho.py and Guccho on GitHub
- we're fully open source!`,
  },
  service: {
  },
} as const satisfies DeepPartial<GlobalI18n>
