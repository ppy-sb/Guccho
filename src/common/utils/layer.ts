import type { DeepPartial } from '@trpc/server'
import { merge } from 'lodash-es'

export function layer<T extends object>(...locales: readonly [T, ...DeepPartial<T>[]]): T {
  return locales.reduce((acc, cur) => merge(acc, cur)) as T
}

export class Layer<T extends object> {
  base: T
  constructor(base: T) {
    this.base = base
  }

  layers: DeepPartial<T>[] = []
  add(...layers: readonly DeepPartial<T>[]) {
    this.layers.push(...layers)
    return this
  }

  flat(): T {
    return layer(this.base, ...this.layers)
  }
}
