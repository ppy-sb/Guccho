import type { DeepPartial } from '@trpc/server'
import type { GlobalI18n } from '~/locales/@types'

export interface ServerLocale extends DeepPartial<GlobalI18n> {
  landing: {
    content: string
  }
}
