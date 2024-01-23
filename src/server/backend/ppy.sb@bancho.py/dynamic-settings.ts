import { literal, nativeEnum } from 'zod'
import { settings as base } from '../bancho.py/dynamic-settings'
import { defineDynamicUserSetting } from '$base/@define-setting'
import { DynamicSettingStore } from '~/def/user'
import { Lang, PPRank, Rank, ScoreRank } from '~/def'
import { rankingSystem } from '~/common/utils/locales'

export const settings = {
  ...base,
  ingameLeaderboard: defineDynamicUserSetting({
    store: DynamicSettingStore.Server,
    label: 'ingame-leaderboard',
    type: 'select',
    validator: nativeEnum(PPRank).or(nativeEnum(ScoreRank)).or(literal(null)),
    options: [
      {
        value: null,
        label: 'default-ingame-leaderboard',
      },
      {
        value: Rank.PPv2,
        label: rankingSystem(Rank.PPv2),
      },
      {
        value: Rank.Score,
        label: rankingSystem(Rank.Score),
      },
    ],
    locale: {
      [Lang.enGB]: {
        'ingame-leaderboard': 'Ingame Leaderboard',
        'default-ingame-leaderboard': 'Default ingame leaderboard',
      },
    },
  }),
}
