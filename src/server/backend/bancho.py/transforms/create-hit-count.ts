import type { Score as DBScore } from 'prisma-client-bancho-py'
import { Mode } from '~/def'
import type { ActiveMode } from '~/def/common'
import type { ManiaHitCount, StandardHitCount } from '~/def/score'

export function createHitCount<M extends ActiveMode>(
  mode: M,
  score: Pick<DBScore, 'n100' | 'n300' | 'n50' | 'nGeki' | 'nKatu' | 'nMiss'>,
) {
  return (mode === Mode.Mania ? hitCountMania(score) : hitCount(score)) as M extends Mode.Mania ? ManiaHitCount : StandardHitCount
}

function hitCountMania(score: Pick<DBScore, 'n100' | 'n300' | 'n50' | 'nGeki' | 'nKatu' | 'nMiss'>): ManiaHitCount {
  return {
    max: score.nGeki,
    300: score.n300,
    200: score.nKatu,
    100: score.n100,
    50: score.n50,
    miss: score.nMiss,
  }
}

function hitCount(score: Pick<DBScore, 'n100' | 'n300' | 'n50' | 'nGeki' | 'nKatu' | 'nMiss'>): StandardHitCount {
  return {
    300: score.n300,
    geki: score.nGeki,
    100: score.n100,
    katu: score.nKatu,
    50: score.n50,
    miss: score.nMiss,
  }
}
