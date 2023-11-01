import { type ZodType, object } from 'zod'
import { Lang } from '~/def'
import type { DynamicSettingStore, DynamicUserSetting } from '~/def/user'

export type ExtractSettingType<TSetting extends Record<string, DynamicUserSetting<any, any, any>>> = {
  [K in keyof TSetting]?: TSetting[K] extends DynamicUserSetting<infer R, any, any> ? R : never
}
export type ExtractSettingValidatorType<TSetting extends Record<string, DynamicUserSetting<any, any, any>>> = {
  [K in keyof TSetting]: TSetting[K] extends DynamicUserSetting<infer R, any, any> ? ZodType<R> : never
}
export type ExtractLocationSettings<TLoc extends DynamicSettingStore, TSetting extends Record<string, DynamicUserSetting<any, any, any>>> = {
  [K in keyof TSetting as TSetting[K] extends DynamicUserSetting<any, TLoc, any> ? K : never]: TSetting[K]
}

export function defineDynamicUserSetting<T, TLoc extends DynamicSettingStore, TLang>(input: DynamicUserSetting<T, TLoc, TLang>) {
  return input as DynamicUserSetting<T, TLoc, TLang>
}

export function extractSettingValidators<TSetting extends Record<string, DynamicUserSetting<any, any, any>>>(settings: TSetting) {
  type TRet = {
    [K in keyof TSetting]: TSetting[K]['validator']
  }
  const returnValue: Partial<TRet> = {}
  for (const setting in settings) {
    returnValue[setting] = settings[setting].validator
  }
  return object(returnValue as TRet)
}

export function extractLocationSettings<TLoc extends DynamicSettingStore, TSetting extends Record<string, DynamicUserSetting<any, any, any>>>(location: TLoc, settings: TSetting): ExtractLocationSettings<TLoc, TSetting> {
  type T = ExtractLocationSettings<TLoc, TSetting>
  const returnValue: Partial<T> = {}

  for (const setting in settings) {
    if (settings[setting as unknown as keyof T].store !== location) {
      continue
    }
    returnValue[setting as unknown as keyof T] = settings[setting as unknown as keyof T]
  }
  return returnValue as unknown as T
}

export function extractSettingLocales<TSetting extends Record<string, DynamicUserSetting<any, any, any>>>(settings: TSetting) {
  type TRet = {
    [L in Lang]?: {
      [K in keyof TSetting]?: NonNullable<TSetting[K]['locale']>[L]
    }
  }

  const returnValue: TRet = {
    [Lang.enGB]: {},
    [Lang.zhCN]: {},
  }
  for (const setting in settings) {
    const _setting = settings[setting]
    for (const lang in _setting.locale) {
      const cur = returnValue[lang as Lang]
      if (!cur) {
        continue
      }
      returnValue[lang as Lang] = Object.assign(cur, settings[setting].locale?.[lang as Lang])
    }
  }
  return returnValue as TRet
}
