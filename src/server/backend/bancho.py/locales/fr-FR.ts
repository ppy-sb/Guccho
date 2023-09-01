import type { DeepPartial } from '@trpc/server'
import type { GlobalI18n } from '~/locales/@types'

export default {
  landing: {
    content: `Nous créons un serveur privé osu! avec des fonctionnalités pour tous les modes. Vous trouverez des algorithmes Relax et Autopilot avancés pour le calcul des pp. Vous pouvez également changer de pseudo comme bon vous semble.
- pour plus d'informations，veuillez visiter gulag et la page GitHub de Guccho。
- notre projet est open source!`,
  },
  service: {
  },
} as const satisfies DeepPartial<GlobalI18n>
