// import type { DeepPartial } from '@trpc/server'
// import type { GlobalI18n } from './src/locales/@types'
import ui from './guccho.ui.config'
import { locales as serverMessages } from '$active/locales'
import { Layer } from '~/common/utils'
import { Lang } from '~/def'
import clientMessages from '~/locales/base'
import { every } from '~/locales/utils'

const locales = new Layer(clientMessages)
  .add(serverMessages)

export default defineI18nConfig(() => {
  return {
    legacy: false,
    locale: Lang.enGB,
    fallbackLocale: Lang.enGB,
    messages: locales.add(every({ server: { name: ui.baseUrl } })).flat(),
  }
})
