import type { Id } from '..'
import { toBeatmapWithBeatmapset } from './beatmap'
import { createHitCount } from './create-hit-count'
import { toMods } from '.'

import type { AbleToTransformToScores } from './index'
import type { RankingStatus } from '~/types/beatmap'
import type {
  Grade,
  LeaderboardRankingSystem,
  Mode,
  PPRankingSystem,
  Ruleset,
} from '~/types/common'
import type { RankingSystemScore, RulesetScore } from '~/types/score'

export function toScore<_RankingSystem extends PPRankingSystem>({
  score,
  mode,
  ruleset,
}: {
  score: AbleToTransformToScores
  mode: Mode
  ruleset: Ruleset
}) {
  const rtn1 = {
    id: score.id,
    playedAt: score.playTime,
    maxCombo: score.maxCombo,
    // mods: score.mods,
    score: BigInt(score.score),
    grade: score.grade,
    accuracy: score.acc,
    hit: createHitCount(mode, score),
    beatmap: (score.beatmap !== null
      && toBeatmapWithBeatmapset(score.beatmap)) || {
      status: 'notFound',
    },
    mods: toMods(score.mods),
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
    (typeof score)['beatmap'] extends null
      ? 'unknown'
      : Exclude<(typeof score)['beatmap'], null>['server'],
    (typeof score)['beatmap'] extends null ? 'notFound' : RankingStatus
  >
  return rtn1
}

export function toRankingSystemScore<
  _RankingSystem extends LeaderboardRankingSystem,
>({
  score,
  rankingSystem,
  mode,
  rank,
}: {
  score: AbleToTransformToScores
  rankingSystem: _RankingSystem
  mode: Mode
  rank: number
}) {
  type HasBeatmap = (typeof score)['beatmap'] extends null
    ? false
    : Exclude<(typeof score)['beatmap'], null>

  const result = {
    id: score.id,
    // mods: score.mods,
    score: BigInt(score.score),
    accuracy: score.acc,
    grade: score.grade as Grade,
    hit: createHitCount(mode, score),
    beatmap: (score.beatmap !== null
      && toBeatmapWithBeatmapset(score.beatmap)) || {
      status: 'notFound',
    },
    mods: toMods(score.mods),
    playedAt: score.playTime,
    maxCombo: score.maxCombo,
    rank,
    pp: (
      (rankingSystem === 'ppv1' || rankingSystem === 'ppv2')
        ? score.pp
        : undefined
    ) as _RankingSystem extends PPRankingSystem ? number : never,
  } satisfies RankingSystemScore<
    bigint,
    Id,
    Mode,
    _RankingSystem,
    HasBeatmap extends null ? 'unknown' : HasBeatmap['server'],
    HasBeatmap extends null ? 'notFound' : RankingStatus
  >
  return result
}

export function toScores({
  scores,
  mode,
  ruleset,
}: {
  scores: AbleToTransformToScores[]
  mode: Mode
  ruleset: Ruleset
}) {
  return scores.map(score => toScore({ score, mode, ruleset }))
}

export function toRankingSystemScores<RS extends LeaderboardRankingSystem>({
  scores,
  mode,
  rankingSystem,
}: {
  scores: AbleToTransformToScores[]
  rankingSystem: RS
  mode: Mode
}) {
  return scores.map((score, index) =>
    toRankingSystemScore({ score, rankingSystem, mode, rank: index + 1 }),
  )
}
// : Flavor extends 'ranking-system' ? :
