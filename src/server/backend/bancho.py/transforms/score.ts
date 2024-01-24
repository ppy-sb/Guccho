import type { Id } from '..'

import { createHitCount } from './create-hit-count'
import {
  type AbleToTransformToScores,
  type PrismaAbleToTransformToScores,
  toBeatmapWithBeatmapset,
  toBeatmapWithBeatmapsetPrisma,
  toMods,
} from '.'
import { Rank } from '~/def'
import { RankingStatus } from '~/def/beatmap'
import type {
  ActiveMode,
  ActiveRuleset,
  LeaderboardRankingSystem,
  PPRankingSystem,
} from '~/def/common'
import type { Grade, RankingSystemScore, RulesetScore } from '~/def/score'

export function toPrismaScore<M extends ActiveMode, RS extends PPRankingSystem>({
  score,
  mode,
  ruleset,
}: {
  score: PrismaAbleToTransformToScores
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
    accuracy: score.acc,
    hit: createHitCount(mode, score),
    beatmap: (score.beatmap !== null
      && toBeatmapWithBeatmapsetPrisma(score.beatmap)) || {
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
    (typeof score)['beatmap'] extends null ? RankingStatus.NotFound : RankingStatus
  >
  return rtn1
}
export function toScore<M extends ActiveMode, RS extends PPRankingSystem>({
  score,
  mode,
  ruleset,
}: {
  score: AbleToTransformToScores
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
    beatmap: (score.beatmap !== null
      && toBeatmapWithBeatmapset(score.beatmap)) || {
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
    (typeof score)['beatmap'] extends null ? RankingStatus.NotFound : RankingStatus
  >
  return rtn1
}

export function prismaToRankingSystemScore<
  M extends ActiveMode,
  RS extends LeaderboardRankingSystem,
>({
  score,
  rankingSystem,
  mode,
  rank,
}: {
  score: PrismaAbleToTransformToScores
  rankingSystem: RS
  mode: M
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
    beatmap: score.beatmap !== null
      ? toBeatmapWithBeatmapsetPrisma(score.beatmap)
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
export function toRankingSystemScore<
  M extends ActiveMode,
  RS extends LeaderboardRankingSystem,
>({
  score,
  rankingSystem,
  mode,
  rank,
}: {
  score: AbleToTransformToScores
  rankingSystem: RS
  mode: M
  rank: number
}) {
  type HasBeatmap = (typeof score)['beatmap'] extends null
    ? false
    : Exclude<(typeof score)['beatmap'], null>

  const result = {
    id: score.id,
    // mods: score.mods,
    score: BigInt(score.score),
    accuracy: score.accuracy,
    grade: score.grade as Grade,
    hit: createHitCount(mode, score),
    beatmap: score.beatmap !== null
      ? toBeatmapWithBeatmapset(score.beatmap)
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

export function prismaToScores({
  scores,
  mode,
  ruleset,
}: {
  scores: PrismaAbleToTransformToScores[]
  mode: ActiveMode
  ruleset: ActiveRuleset
}) {
  return scores.map(score => toPrismaScore({ score, mode, ruleset }))
}

export function prismaToRankingSystemScores<M extends ActiveMode, RS extends LeaderboardRankingSystem>({
  scores,
  mode,
  rankingSystem,
}: {
  scores: PrismaAbleToTransformToScores[]
  rankingSystem: RS
  mode: M
}) {
  return scores.map((score, index) =>
    prismaToRankingSystemScore({ score, rankingSystem, mode, rank: index + 1 }),
  )
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
    toRankingSystemScore({ score, rankingSystem, mode, rank: index + 1 }),
  )
}
