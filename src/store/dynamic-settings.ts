import { defineStore } from 'pinia'
import type { z } from 'zod'
import { DynamicSettingStore } from '../def/user'
import { extractLocationSettings, extractSettingValidators } from '$base/@define-setting'

import { IntlPicker } from '$base/intl-picker'
import { settings } from '$active/dynamic-settings'

export const useClientDynamicSettings = defineStore('dynamic-client', () => {
  const validator = extractSettingValidators(extractLocationSettings(DynamicSettingStore.Local, settings))
  type T = z.infer<typeof validator>
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
