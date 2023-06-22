import type { Score as DBScore } from 'prisma-client-bancho-py'
import { Mode } from '~/types/defs'
import type { ActiveMode } from '~/types/common'
import type { HitCount } from '~/types/score'

export function createHitCount<M extends ActiveMode>(
  mode: M,
  score: DBScore
): HitCount<M> {
  switch (mode) {
    case Mode.Mania: return hitCountMania(score) as HitCount<M & Mode.Mania>
    default: return hitCount(score) as HitCount<M & Exclude<ActiveMode, Mode.Mania>>
  }
}

function hitCountMania(score: DBScore) {
  return {
    max: score.nGeki,
    300: score.n300,
    200: score.nKatu,
    100: score.n100,
    50: score.n50,
    miss: score.nMiss,
  }
}

function hitCount(score: DBScore) {
  return {
    300: score.n300,
    geki: score.nGeki,
    100: score.n100,
    katu: score.nKatu,
    50: score.n50,
    miss: score.nMiss,
  }
}
