import { merge } from 'lodash-es'
import { Lang } from './src/def'

import clientMessages from './src/locales'
import { locales as serverMessages } from '$active/locales'

const messages = merge(clientMessages, serverMessages)

export default defineI18nConfig(() => ({
  legacy: false,
  locale: Lang.enGB,
  fallbackLocale: Lang.enGB,
  messages,
}))
