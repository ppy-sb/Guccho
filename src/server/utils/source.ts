import { BeatmapSource, type Foreign, type Local, type Unknown } from '~/def/beatmap'

export function isReferencedMapOrMapset<T extends { source: BeatmapSource }>(input: T): input is T & { source: Foreign } {
  return input.source === BeatmapSource.Bancho || input.source === BeatmapSource.PrivateServer
}

export function isLocalMapOrMapset<T extends { source: BeatmapSource }>(input: T): input is T & { source: Local | Unknown } {
  return input.source === BeatmapSource.Local || input.source === BeatmapSource.Unknown
}
