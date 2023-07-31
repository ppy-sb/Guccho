import { enGB, zhCN } from './src/locales'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'en-GB',
  fallbackLocale: 'en-GB',
  messages: {
    'en-GB': enGB,
    'zh-CN': zhCN,
  },
}))
