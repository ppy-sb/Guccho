import { type ZodType, object } from 'zod'
import type { LocaleMessageValue } from 'vue-i18n'
import { Lang } from '~/def'
import type { DynamicSettingStore, DynamicUserSetting } from '~/def/user'

type SettingObject = Record<string, DynamicUserSetting<any, any, any>>

export type ExtractSettingType<TSetting extends SettingObject> = {
  [K in keyof TSetting]?: TSetting[K] extends DynamicUserSetting<infer R, any, any> ? R : never
}
export type ExtractSettingValidatorType<TSetting extends SettingObject> = {
  [K in keyof TSetting]: TSetting[K] extends DynamicUserSetting<infer R, any, any> ? ZodType<R> : never
}
export type ExtractLocationSettings<TLoc extends DynamicSettingStore, TSetting extends SettingObject> = {
  [K in keyof TSetting as TSetting[K] extends DynamicUserSetting<any, TLoc, any> ? K : never]: TSetting[K]
}

export function defineDynamicUserSetting<T, TLoc extends DynamicSettingStore, TLang>(input: DynamicUserSetting<T, TLoc, TLang>) {
  return input as DynamicUserSetting<T, TLoc, TLang>
}

export function extractSettingValidators<TSetting extends SettingObject>(settings: TSetting) {
  type TRet = {
    [K in keyof TSetting]: TSetting[K]['validator']
  }
  const returnValue: Partial<TRet> = {}
  for (const setting in settings) {
    returnValue[setting] = settings[setting].validator
  }
  return object(returnValue as TRet)
}

export function extractLocationSettings<TLoc extends DynamicSettingStore, TSetting extends SettingObject>(location: TLoc, settings: TSetting): ExtractLocationSettings<TLoc, TSetting> {
  type T = ExtractLocationSettings<TLoc, TSetting>
  const returnValue: Partial<T> = {}

  for (const setting in settings) {
    if (settings[setting as unknown as keyof T]?.store !== location) {
      continue
    }
    returnValue[setting as unknown as keyof T] = settings[setting as unknown as keyof T]
  }
  return returnValue as unknown as T
}

/**
 * Collect the per-language message bundles declared by dynamic settings.
 *
 * Every supported language is always present (possibly empty), so the result can be passed
 * straight to `useI18n({ messages })` without the caller narrowing it first.
 */
export function extractSettingLocales<TSetting extends SettingObject>(
  settings: TSetting,
): Record<Lang, Record<string, LocaleMessageValue>> {
  const returnValue: Record<Lang, Record<string, LocaleMessageValue>> = {
    [Lang.enGB]: {},
    [Lang.zhCN]: {},
    [Lang.frFR]: {},
    [Lang.deDE]: {},
  }

  for (const setting in settings) {
    const locale = settings[setting].locale
    if (!locale) {
      continue
    }
    for (const lang in locale) {
      const messages = locale[lang as Lang]
      const bundle = returnValue[lang as Lang]
      if (messages && bundle) {
        Object.assign(bundle, messages)
      }
    }
  }
  return returnValue
}
