import enGB from './en-GB'
import type { GlobalI18n } from '.'
import { Rank } from '~/def'

export default {
  mode: enGB.mode,
  ruleset: enGB.ruleset,
  rank: {
    [Rank.PPv2]: 'Performance(v2)',
    [Rank.PPv1]: 'Performance(v1)',
    [Rank.RankedScore]: '计入排行榜总分',
    [Rank.TotalScore]: '总分',
    [Rank.Score]: '分数',
  },
  titles: {
    leaderboard: '排行榜',
    status: '状态',
    beatmap: '图',
    beatmapset: '图组',
    Settings: '设置',
  },
} as GlobalI18n
