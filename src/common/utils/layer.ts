import type { DeepPartial } from '@trpc/server'
import { merge } from 'lodash-es'

export function layer<T extends object>(...locales: readonly [T, ...DeepPartial<T>[]]): T {
  return locales.reduce((acc, cur) => merge(acc, cur)) as T
}
