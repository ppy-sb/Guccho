import { defineStore } from 'pinia'
import { DynamicSettingStore } from '../def/user'
import { type ExtractSettingType, extractLocationSettings, extractSettingValidators } from '$base/@define-setting'

import { IntlPicker } from '$base/intl-picker'
import { settings } from '$active/dynamic-settings'

export const useClientDynamicSettings = defineStore('dynamic-client', () => {
  const validator = extractSettingValidators(extractLocationSettings(DynamicSettingStore.Local, settings))
  type T = ExtractSettingType<typeof settings>
  const data = ref<T>({
    intlName: IntlPicker.Intl,
  })
  return {
    data,
    save(_data: T) {
      data.value = validator.parse(_data)
    },
  }
}, {
  persist: {
    key: 'client-settings',
  },
})
