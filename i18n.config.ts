import { locales as serverMessages } from '$active/locales'
import { layer } from '~/common/utils'
import { Lang } from '~/def'
import type { AllLocales } from '~/locales/@types'
import clientMessages from '~/locales/base'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: Lang.enGB,
  fallbackLocale: Lang.enGB,
  messages: layer<AllLocales>(
    clientMessages,
    serverMessages
  ),
}))
