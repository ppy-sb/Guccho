import type { BeatmapSource, Beatmapset } from '~/types/beatmap'

export function assertNotReachable(..._any: never[]): never {
  throw new Error('boom! this line should not be reached!!')
}

export function assertIsString(input: unknown): input is string {
  return typeof input === 'string'
}

export function assertIsBanchoBeatmapset(test: Beatmapset<BeatmapSource, any, unknown>): test is Beatmapset<'bancho', any, string | number> {
  return test.source === 'bancho'
}

export function assertIncludes<T>(input: any, array: T[]): input is T {
  return array.includes(input)
}

export function loadImage(src: string) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', resolve)
    image.addEventListener('error', reject)
    image.src = src
  })
}

export function noop() { }

export function placeholder(e: Event & { target: HTMLImageElement }) {
  e.target.src = '/images/image-placeholder.svg'
}
