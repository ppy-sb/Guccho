import type { Score as DBScore } from '@prisma/client'
import type { Mode, RankingSystem, Ruleset } from '~/types/common'
import type { RulesetScore } from '~/types/score'

export function createHitCount<_Mode extends Mode>(mode: _Mode, score: DBScore) {
  return (mode === 'mania'
    ? {
        max: score.ngeki,
        300: score.n300,
        200: score.nkatu,
        100: score.n100,
        50: score.n50,
        miss: score.nmiss,
      }
    : {
        300: score.n300,
        geki: score.ngeki,
        100: score.n100,
        katu: score.nkatu,
        50: score.n50,
        miss: score.nmiss,
      }) as unknown as RulesetScore<unknown, unknown, _Mode, Ruleset, RankingSystem>['hit']
}
