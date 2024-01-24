import { BeatmapSource, type Beatmapset, type ReferencedBeatmapset } from '~/def/beatmap'

export function isString(input: unknown): input is string {
  return typeof input === 'string'
}

export function isBanchoBeatmapset(
  test: Beatmapset<any, unknown>,
): test is ReferencedBeatmapset<any, string | number> & { source: BeatmapSource.Bancho } {
  return test.source === BeatmapSource.Bancho
}

export function includes<T>(input: unknown, array: readonly T[]): input is T {
  return array.includes(input as T)
}

export function checkAvatar(file: ArrayBuffer) {
  return file.byteLength <= 2_000_000 // 2 MB
}
