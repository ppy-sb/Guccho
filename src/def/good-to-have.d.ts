import type { ShallowReactive } from 'vue'

declare global {
  declare type UnwrapShallowReactive<T extends ShallowReactive<any>> = T extends ShallowReactive<infer R> ? R : never
}
