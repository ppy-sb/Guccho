import { merge } from 'lodash-es'

import frFR from '../../bancho.py/locales/fr-FR'
import type { ServerLocale } from './@types'

export default merge(frFR, {
  landing: {
    content: `Bienvenue sur {title} ，un serveur privé osu! complet. Nous disposons d'algorithmes Relax et Autopilot avancés, tout en calculant les pp pour tous les modes.
Nous avons un classement général et vous pouvez également changer de pseudo comme bon vous semble.
Notre bot catgirl est disponible 24/7 sur le groupe pour vous aider.
Pour plus de détails, veuillez rejoindre notre groupe QQ: 792778662。
La nouvelle version de Guccho est actuellement dans sa phase de test. Si vous rencontrez des problèmes ou avez des suggestions, n'hésitez pas à nous contacter.`,
  },
} satisfies ServerLocale as ServerLocale)
