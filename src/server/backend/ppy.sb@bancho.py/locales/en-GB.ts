import type { DeepPartial } from '@trpc/server'
import { merge } from 'lodash-es'

import enGB from '../../bancho.py/locales/en-GB'
import type { GlobalI18n } from '~/locales/@types'

export default merge(enGB, {
  landing: {
    content: `Welcome to {title}, a fully-featured osu! private server. We feature state-of-the-art RX and AP algorithms, while also providing PP calculation support for all modes.
We have global leaderboards and unlimited times for changing your name.
Our catgirl bot is available 24/7 in the group to assist you with score queries and other services.
For more details, please join our QQ group: 792778662.
The new version of Guccho is currently in the testing phase. If you encounter any issues or have suggestions for improvements, please feel free to contact us and communicate.`,
  },
} as const satisfies DeepPartial<GlobalI18n>)
