import type { Score as DBScore } from '@prisma/client'
import type { Mode, RankingSystem, Ruleset } from '~/types/common'
import type { RulesetScore } from '~/types/score'

export function createHitCount<_Mode extends Mode>(mode: _Mode, score: DBScore): RulesetScore<unknown, unknown, _Mode, Ruleset, RankingSystem>['hit'] {
  return (mode === 'mania'
    ? {
        max: score.ngeki,
        300: score.n300,
        200: score.nkatu,
        100: score.n100,
        50: score.n50,
        miss: score.nmiss,
      } as RulesetScore<unknown, unknown, _Mode & 'mania', Ruleset, RankingSystem>['hit']
    : {
        300: score.n300,
        geki: score.ngeki,
        100: score.n100,
        katu: score.nkatu,
        50: score.n50,
        miss: score.nmiss,
      } as RulesetScore<unknown, unknown, _Mode & Exclude<Mode, 'mania'>, Ruleset, RankingSystem>['hit'])
}
