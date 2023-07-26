import { enGB, zhCN } from './src/i18n'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'en-GB',
  messages: {
    'en-GB': enGB,
    'zh-CN': zhCN,
  },
}))
