export * from './asserts'

export function loadImage(src: string) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', resolve)
    image.addEventListener('error', reject)
    image.src = src
  })
}

export function noop() {}

export function placeholder(e: Event & { target: HTMLImageElement }) {
  e.target.src = '/images/image-placeholder.svg'
}

export const TSFilter = <T>(item: T): item is Exclude<T, undefined | null> =>
  item !== undefined && item !== null

export function pick<T extends Record<any, any>, K extends keyof T>(record: T, keys: K[]) {
  return keys.reduce<Partial<T>>((acc, cur) => {
    acc[cur] = record[cur]
    return acc
  }, {}) as { [P in K]: T[P]; }
}
