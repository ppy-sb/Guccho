import { z } from 'zod'
import { defineDynamicUserSetting } from './define-setting'
import { IntlPicker } from './intl-picker'
import { DynamicSettingStore } from '~/def/user'
import { Lang } from '~/def'

export const settings = {
  intlName: defineDynamicUserSetting({
    store: DynamicSettingStore.Local,
    label: 'intl-name.literal',
    type: 'select',
    options: [
      { value: IntlPicker.Empty, label: 'intl-name.empty', disabled: true },
      { value: IntlPicker.Localized, label: 'intl-name.localized' },
      { value: IntlPicker.Intl, label: 'intl-name.intl' },
    ],
    validator: z.nativeEnum(IntlPicker),
    locale: {
      [Lang.enGB]: {
        'intl-name': {
          literal: 'Unicode Beatmap names',
          intl: 'International',
          localized: 'Localized',
          empty: 'Select',
        },
      },
      [Lang.zhCN]: {
        'intl-name': {
          literal: '歌曲名称显示方式',
          intl: '国际名称',
          localized: '原语言/本地化',
          empty: '请选择',
        },
      },
    },
  }),
} as const
