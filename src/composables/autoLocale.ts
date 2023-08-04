import { IntlPicker } from '~/server/backend/$base/intl-picker'
import { useClientDynamicSettings } from '~/store/dynamic-settings'

export function autoLocale(meta: {
  artist?: string
  title?: string
  intl: {
    artist: string
    title: string
  }
}): {
    artist: string
    title: string
  } {
  const clientSetting = useClientDynamicSettings()
  switch (clientSetting.data.intlName) {
    case IntlPicker.Intl: {
      return meta.intl
    }
    case IntlPicker.Localized: {
      return {
        artist: meta.artist || meta.intl.artist,
        title: meta.title || meta.intl.title,
      }
    }
    default: {
      return meta.intl
    }
  }
}
