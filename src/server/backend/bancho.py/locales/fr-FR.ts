import type { DeepPartial } from '@trpc/server'
import type { GlobalI18n } from '~/locales/@types'

export default {
  landing: {
    content: `Un serveur privé osu! pour tous les modes, avec algorithmes RX/AP, calcul des pp, classement général et changements de pseudo illimités.
- Plus d'infos : dépôts GitHub de gulag et Guccho.
- Projet entièrement open source.`,
  },
  service: {
  },
} as const satisfies DeepPartial<GlobalI18n>
