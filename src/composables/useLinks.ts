import type { BeatmapSource, Beatmapset } from '~/def/beatmap'

type AnyBeatmapset = Beatmapset<BeatmapSource, any, any>
// type BanchoBeatmapset = Beatmapset<'bancho', any, any>
export interface Label {
  label: string
  link: string
}

export function useExternalBeatmapsetLinks(beatmapset: AnyBeatmapset) {
  const returnValue = {
    external: [] as Label[],
    directDownload: [] as Label[],
  }
  if (isBanchoBeatmapset(beatmapset)) {
    returnValue.external.push({
      label: 'Bancho',
      link: `https://osu.ppy.sh/s/${beatmapset.foreignId}`,
    })

    returnValue.directDownload.push(
      {
        label: 'Chimu.moe',
        link: `https://api.chimu.moe/v1/download/${beatmapset.foreignId}`,
      },
      {
        label: 'osu.direct (previously known as Kitsu.moe)',
        link: `https://osu.direct/api/d/${beatmapset.foreignId}`,
      },
    )
  }
  return returnValue
}
