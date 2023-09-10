import type { Id } from '..'
import { toBeatmapWithBeatmapset } from './beatmap'
import { createHitCount } from './create-hit-count'
import { toMods } from '.'

import type { AbleToTransformToScores } from './index'
import type { BeatmapSource } from '~/def/beatmap'
import { RankingStatus } from '~/def/beatmap'
import type {
  ActiveMode,
  ActiveRuleset,
  LeaderboardRankingSystem,
  PPRankingSystem,
} from '~/def/common'
import type { Grade, RankingSystemScore, RulesetScore } from '~/def/score'
import { Rank } from '~/def'

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
    accuracy: score.acc,
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
    (typeof score)['beatmap'] extends null
      ? BeatmapSource.Unknown
      : BeatmapSource.Bancho | BeatmapSource.PrivateServer | BeatmapSource.Unknown,
    (typeof score)['beatmap'] extends null ? RankingStatus.NotFound : RankingStatus
  >
  return rtn1
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
    accuracy: score.acc,
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
    HasBeatmap extends null ? BeatmapSource.Unknown : BeatmapSource.Bancho | BeatmapSource.PrivateServer,
    HasBeatmap extends null ? RankingStatus.NotFound : Exclude<RankingStatus, RankingStatus.NotFound>
  >
  return result
}

export function toScores({
  scores,
  mode,
  ruleset,
}: {
  scores: AbleToTransformToScores[]
  mode: ActiveMode
  ruleset: ActiveRuleset
}) {
  return scores.map(score => toScore({ score, mode, ruleset }))
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
    toRankingSystemScore({ score, rankingSystem, mode, rank: index + 1 })
  )
}
