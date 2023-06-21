export * from './asserts'
export * from './guards'
export * from './map'
export * from './level'
export * from './privilege'

export function noop<T extends undefined | void = void>(): T
export function noop(): void {}

export function TSFilter<T>(item: T): item is NonNullable<T> {
  return item !== undefined && item !== null
}

export function pick<T extends Record<any, any>, K extends keyof T>(record: T, keys: K[]) {
  return keys.reduce<Partial<T>>((acc, cur) => {
    acc[cur] = record[cur]
    return acc
  }, {}) as { [P in K]: T[P]; }
}

export function capitalizeFirstLetter<T extends string>(string: T) {
  return (string.charAt(0).toUpperCase() + string.slice(1)) as Capitalize<T>
}
