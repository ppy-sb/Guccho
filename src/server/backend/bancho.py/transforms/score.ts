import type { Id } from '..'

import { createHitCount } from './create-hit-count'
import {
  type AbleToTransformToScores,
  toBeatmapWithBeatmapset,
  toMods,
} from '.'
import { Rank } from '~/def'
import { RankingStatus } from '~/def/beatmap'
import type {
  ActiveMode,
  ActiveRuleset,
  LeaderboardRankingSystem,
  PPRankingSystem,
} from '$active'
import type { Grade, RankingSystemScore, RulesetScore } from '~/def/score'

export function toScore<M extends ActiveMode, RS extends PPRankingSystem>({
  score,
  beatmap,
  source,
  mode,
  ruleset,
}: {
  score: AbleToTransformToScores['score']
  beatmap: AbleToTransformToScores['beatmap'] | null
  source: AbleToTransformToScores['source']
  mode: M
  ruleset: ActiveRuleset
}) {
  const rtn1 = {
    id: score.id,
    playedAt: score.playTime,
    maxCombo: score.maxCombo,
    // mods: score.mods,
    score: BigInt(score.score),
    grade: (score.grade === 'N' ? 'F' : score.grade) as Grade,
    accuracy: score.accuracy,
    hit: createHitCount(mode, score),
    beatmap: (beatmap !== null
      && toBeatmapWithBeatmapset(beatmap, source)) || {
      status: RankingStatus.NotFound,
    },
    mods: toMods(score.mods),
    ruleset,
    mode,
    [Rank.PPv2]: {
      rank: 0,
      pp: score.pp,
    },
  } as RulesetScore<
    bigint,
    Id,
    ActiveMode,
    ActiveRuleset,
    RS,
    (typeof beatmap) extends null ? RankingStatus.NotFound : RankingStatus
  >
  return rtn1
}

export function toRankingSystemScore<
  M extends ActiveMode,
  RS extends LeaderboardRankingSystem,
>({
  score,
  beatmap,
  source,
  rankingSystem,
  mode,
  rank,
}: {
  score: AbleToTransformToScores['score']
  beatmap: AbleToTransformToScores['beatmap']
  source: AbleToTransformToScores['source']
  rankingSystem: RS
  mode: M
  rank: number
}) {
  type HasBeatmap = (typeof beatmap) extends null
    ? false
    : Exclude<(typeof beatmap), null>

  const result = {
    id: score.id,
    // mods: score.mods,
    score: BigInt(score.score),
    accuracy: score.accuracy,
    grade: score.grade as Grade,
    hit: createHitCount(mode, score),
    beatmap: beatmap !== null
      ? toBeatmapWithBeatmapset(beatmap, source)
      : {
          status: RankingStatus.NotFound,
        },
    mods: toMods(score.mods),
    playedAt: score.playTime,
    maxCombo: score.maxCombo,
    rank,
    pp: (
      (rankingSystem === Rank.PPv1 || rankingSystem === Rank.PPv2)
        ? score.pp
        : undefined
    ) as RS extends PPRankingSystem ? number : never,
  } as RankingSystemScore<
    bigint,
    Id,
    M,
    RS,
    HasBeatmap extends null ? RankingStatus.NotFound : Exclude<RankingStatus, RankingStatus.NotFound>
  >
  return result
}

export function toRankingSystemScores<M extends ActiveMode, RS extends LeaderboardRankingSystem>({
  scores,
  mode,
  rankingSystem,
}: {
  scores: AbleToTransformToScores[]
  rankingSystem: RS
  mode: M
}) {
  return scores.map((score, index) =>
    toRankingSystemScore({ ...score, rankingSystem, mode, rank: index + 1 }),
  )
}
