import type { Id } from '..'
import { toBeatmapWithBeatmapset } from './beatmap'
import { createHitCount } from './create-hit-count'
import { toMods } from '.'

import type { AbleToTransformToScores } from './index'
import { BeatmapSource, RankingStatus } from '~/types/beatmap'
import type {
  ActiveMode,
  ActiveRuleset,
  LeaderboardRankingSystem,
  PPRankingSystem,
} from '~/types/common'
import { Grade, RankingSystemScore, RulesetScore } from '~/types/score'
import { Rank } from '~/types/defs'

export function toScore<RS extends PPRankingSystem>({
  score,
  mode,
  ruleset,
}: {
  score: AbleToTransformToScores
  mode: ActiveMode
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
      ? RankingStatus.Unknown
      : BeatmapSource.Bancho | BeatmapSource.PrivateServer | BeatmapSource.Unknown,
    (typeof score)['beatmap'] extends null ? RankingStatus.NotFound : RankingStatus
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
  mode: ActiveMode
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
    ) as _RankingSystem extends PPRankingSystem ? number : never,
  } as RankingSystemScore<
    bigint,
    Id,
    ActiveMode,
    _RankingSystem,
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

export function toRankingSystemScores<RS extends LeaderboardRankingSystem>({
  scores,
  mode,
  rankingSystem,
}: {
  scores: AbleToTransformToScores[]
  rankingSystem: RS
  mode: ActiveMode
}) {
  return scores.map((score, index) =>
    toRankingSystemScore({ score, rankingSystem, mode, rank: index + 1 })
  )
}
