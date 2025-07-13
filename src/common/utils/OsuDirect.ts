// eslint-disable-next-line antfu/no-const-enum
export const enum Type {
  Beatmap = 'b',
  Beatmapset = 'dl',
}
export function link(type: Type, beatmapId: string) {
  return `osu://${type}/${beatmapId}`
}
