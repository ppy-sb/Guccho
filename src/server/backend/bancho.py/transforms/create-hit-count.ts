import type { Score as DBScore } from 'prisma-client-bancho-py'
import { Mode } from '~/def'
import type { ActiveMode } from '~/def/common'
import type { ManiaHitCount, StandardHitCount } from '~/def/score'

export function createHitCount<M extends ActiveMode>(
  mode: M,
  score: DBScore
) {
  return (mode === Mode.Mania ? hitCountMania(score) : hitCount(score)) as M extends Mode.Mania ? ManiaHitCount : StandardHitCount
}

function hitCountMania(score: DBScore): ManiaHitCount {
  return {
    max: score.nGeki,
    300: score.n300,
    200: score.nKatu,
    100: score.n100,
    50: score.n50,
    miss: score.nMiss,
  }
}

function hitCount(score: DBScore): StandardHitCount {
  return {
    300: score.n300,
    geki: score.nGeki,
    100: score.n100,
    katu: score.nKatu,
    50: score.n50,
    miss: score.nMiss,
  }
}
