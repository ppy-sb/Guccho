import ui from './guccho.ui.config'
import { locales as serverMessages } from '$active/locales'
import { Layer } from '~/common/utils'
import { Lang } from '~/def'
import clientMessages from '~/locales/base'
import { every } from '~/locales/utils'

const locales = new Layer(clientMessages)
  .add(serverMessages)

if (ui.legacyOption?.name) {
  locales.add(every({ server: { name: ui.legacyOption.name } }))
}
if (ui.i18n?.messages) {
  locales.add(ui.i18n.messages)
}

export default defineI18nConfig(() => {
  return {
    legacy: false,
    locale: Lang.enGB,
    fallbackLocale: Lang.enGB,
    messages: locales.flat(),
  }
})
