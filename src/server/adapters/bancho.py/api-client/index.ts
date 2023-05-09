import type { BanchoPyMode, BanchoPyRankedStatus } from '../enums'
import { assertIsBanchoPyMode, fromBanchoPyMode, toRankingStatus } from '../transforms'

enum Action {
  idle = 0,
  afk = 1,
  playing = 2,
  editing = 3,
  modding = 4,
  multiplayer = 5,
  watching = 6,
  unknown = 7,
  testing = 8,
  submitting = 9,
  paused = 10,
  lobby = 11,
  multiplaying = 12,
  osuDirect = 13,
}

type HasBeatmapMeta = Action.playing | Action.editing | Action.editing | Action.modding | Action.modding | Action.watching | Action.testing | Action.multiplaying | Action.osuDirect

interface GulagStatusBeatmap {
  md5: string
  id: number
  set_id: number
  artist: string
  title: string
  version: string
  creator: string
  last_update: number
  total_length: number
  max_combo: number
  status: BanchoPyRankedStatus
  plays: number
  passes: number
  mode: BanchoPyMode
  bpm: number
  cs: number
  od: number
  ar: number
  hp: number
  diff: number
}

type LiveUserStatus =
  | {
    status: 200
    statusText: string
    ok: true
    json: () => PromiseLike<
      | {
        status: 'success'
        player_status: {
          online: true
          login_time: number
          status: {
            action: Exclude<Action, HasBeatmapMeta> // int(player.status.action),
            info_text: string // player.status.info_text,
            mode: number // int(player.status.mode),
            mods: number // int(player.status.mods),
          }
        }
      }
      | {
        status: 'success'
        player_status: {
          online: true
          login_time: number
          status: {
            action: HasBeatmapMeta // int(player.status.action),
            info_text: string // player.status.info_text,
            mode: number // int(player.status.mode),
            mods: number // int(player.status.mods),
            beatmap: GulagStatusBeatmap
          }
        }
      }
      | {
        status: 'success'
        player_status: {
          online: false
          last_seen: number
        }
      }>
  }
  | {
    ok: false
    status: 404
    statusText: string
    json: () => PromiseLike<{ status: 'Player not found.' }>
  }
  | {
    ok: false
    status: 400
    statusText: string
    json: () => PromiseLike<{ status: 'Must provide either id OR name!' }>
  }

function createFetch(endpoint: string) {
  if (endpoint.endsWith('/')) {
    endpoint = endpoint.slice(0, -1)
  }
  return (resource: string | URL, options?: RequestInit & { params?: Record<string, string | number> }) => {
    const url = new URL (endpoint + resource)
    if (options?.params) {
      for (const key of Object.keys(options.params)) {
        url.searchParams.append(key, options.params[key].toString())
      }
    }
    return fetch(url, options)
  }
}

export async function getLiveUserStatus({ id }: { id: number }, config: { api: { v1: string } }) {
  const fetch = createFetch(config.api.v1)
  const result = <LiveUserStatus> await fetch('/get_player_status', {
    method: 'get',
    params: {
      id,
    },
  })
  if (!result.ok) {
    throw new Error(result.statusText)
  }
  const status = await result.json()
  const s = status.player_status

  if (!s.online) {
    return {
      status: 'offline',
      lastSeen: new Date(s.last_seen * 1000),
    } as const
  }
  assertIsBanchoPyMode(s.status.mode)
  const [mode, ruleset] = fromBanchoPyMode(s.status.mode)
  const base = {
    status: Action[s.status.action] as keyof typeof Action,
    description: s.status.info_text,
    mode,
    ruleset,
    beatmap: undefined,
  } as const
  if (!('beatmap' in s.status)) {
    return base
  }
  const bm = s.status.beatmap
  const rankingStatus = toRankingStatus(bm.status)
  if (!rankingStatus) {
    throw new Error('unknown ranking status')
  }
  return {
    ...base,
    beatmap: {
      id: bm.id,
      foreignId: bm.id,
      md5: bm.md5,
      version: bm.version,
      creator: bm.creator,
      // lastUpdate: new Date(bm.last_update * 1000),
      // status: rankingStatus,
      // properties: {
      //   bpm: bm.bpm,
      //   circleSize: bm.cs,
      //   approachRate: bm.ar,
      //   accuracy: bm.od,
      //   hpDrain: bm.hp,
      //   totalLength: bm.total_length,
      //   maxCombo: bm.max_combo,
      //   starRate: bm.diff,
      //   count: {
      //     circles: 0,
      //     sliders: 0,
      //     spinners: 0,
      //   },
      // },
      beatmapset: {
        id: bm.set_id,
        foreignId: bm.set_id,
        meta: {
          intl: {
            artist: bm.artist,
            title: bm.title,
          },
        },
        source: 'bancho',
      },
    },
  } as const
}
