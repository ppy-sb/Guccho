import type { ShallowReactive } from 'vue'

declare global {
  declare type UnwrapShallowReactive<T extends ShallowReactive<any>> = T extends ShallowReactive<infer R> ? R : never
}

declare module 'vue-i18n-routing' {
  import type { CountryCode } from '~/def/country-code'

  interface LocaleObject {
    flag: CountryCode
  }
}
