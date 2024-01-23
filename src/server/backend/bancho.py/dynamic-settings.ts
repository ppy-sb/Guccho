import { string } from 'zod'
import { defineDynamicUserSetting } from '$base/@define-setting'
import * as base from '$base/dynamic-settings'
import { DynamicSettingStore } from '~/def/user'
import { Lang } from '~/def'

export const settings = {
  apiKey: defineDynamicUserSetting({
    store: DynamicSettingStore.Server,
    label: 'api-key',
    type: 'input',
    readonly: true,
    validator: string().optional(),
    locale: {
      [Lang.enGB]: {
        'api-key': 'API Key',
      },
    },
  }),
  ...base.settings,
}
