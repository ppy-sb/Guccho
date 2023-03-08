import type { BeatmapSource, Beatmapset } from '~/types/beatmap'

export function assertIsString(input: unknown): input is string {
  return typeof input === 'string'
}

export function assertIsBanchoBeatmapset(
  test: Beatmapset<BeatmapSource, any, unknown>,
): test is Beatmapset<'bancho', any, string | number> {
  return test.source === 'bancho'
}

export function assertIncludes<T>(input: any, array: readonly T[]): input is T {
  return array.includes(input)
}

export function checkAvatar(file: ArrayBuffer) {
  return file.byteLength <= 2_000_000 // 2 MB
}
