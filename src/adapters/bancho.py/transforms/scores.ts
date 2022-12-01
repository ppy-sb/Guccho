import type { IdType as Id } from '../config'
import { createHitCount } from './createHitCount'
import { toBeatmap } from './toBeatmapSet'
import type { AbleToTransformToScores } from './index'
import type { Beatmap, RankingStatus } from '~/types/beatmap'
import type { RankingSystemScore, RulesetScore } from '~/types/score'
import type { Mode, RankingSystem, Ruleset } from '~/types/common'

export function toScore<_RankingSystem extends RankingSystem>({ score, mode, ruleset }: {
  score: AbleToTransformToScores
  mode: Mode
  ruleset: Ruleset
}) {
  const rtn1 = {
    id: score.id,
    playedAt: new Date(0),
    maxCombo: 0,
    // mods: score.mods,
    score: BigInt(score.score),
    grade: 'ssh',
    accuracy: 98,
    hit: createHitCount(mode, score),
    beatmap: (score.beatmap !== null && toBeatmap(score.beatmap)) || {
      status: 'notFound',
    } as Beatmap<'unknown', 'notFound', never, never>,
    // TODO: calculate mods
    mods: [],
    ruleset,
    mode,
    ppv2: {
      rank: 0,
      pp: score.pp,
    },
  } as RulesetScore<
    bigint,
    Id,
    Mode,
    Ruleset,
    _RankingSystem,
    typeof score['beatmap'] extends null
      ? 'unknown'
      : Exclude<typeof score['beatmap'], null>['server'],
    typeof score['beatmap'] extends null
      ? 'notFound'
      : RankingStatus
  >
  return rtn1
}

export function toRankingSystemScore<_RankingSystem extends RankingSystem>({ score, rankingSystem, mode }: {
  score: AbleToTransformToScores
  rankingSystem: _RankingSystem
  mode: Mode
}) {
  const result = Object.assign(
    {
      id: score.id,
      // mods: score.mods,
      score: BigInt(score.score),
      accuracy: score.acc,
      grade: score.grade,
      hit: createHitCount(mode, score),
      beatmap: (score.beatmap !== null && toBeatmap(score.beatmap)) || {
        status: 'notFound',
      } as Beatmap<'unknown', 'notFound', never, never>,
      // TODO: calculate mods
      mods: [],
      playedAt: score.playTime,
      maxCombo: score.maxCombo,
    },
    rankingSystem === 'ppv2'
      ? {
          rank: 1,
          pp: score.pp,
        }
      : {},
  ) as RankingSystemScore<
    bigint, Id, Mode, _RankingSystem & 'ppv2', typeof score['beatmap'] extends null ? 'unknown' : Exclude<typeof score['beatmap'], null>['server'], typeof score['beatmap'] extends null ? 'notFound' : RankingStatus
  >
  return result
}

export function toScores({ scores, mode, ruleset }: {
  scores: AbleToTransformToScores[]
  mode: Mode
  ruleset: Ruleset
}) {
  return scores.map(score => toScore({ score, mode, ruleset }))
}

export function toRankingSystemScores<RS extends RankingSystem>({ scores, mode, rankingSystem }: {
  scores: AbleToTransformToScores[]
  rankingSystem: RS
  mode: Mode
}) {
  return scores.map(score => toRankingSystemScore({ score, rankingSystem, mode }))
}
// : Flavor extends 'ranking-system' ? :
