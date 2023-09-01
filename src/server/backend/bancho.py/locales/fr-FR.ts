import type { DeepPartial } from '@trpc/server'

import type { GlobalI18n } from '~/locales/@types'

export default {
  landing: {
    content: `Nous créons un serveur privé osu! avec des fonctionnalités jamais vues auparavant!
- pour plus d'informations, regardez bancho.py et Guccho sur GitHub
- nous sommes entièrement Open source`,
  },
  service: {
  },
} as const satisfies DeepPartial<GlobalI18n>
