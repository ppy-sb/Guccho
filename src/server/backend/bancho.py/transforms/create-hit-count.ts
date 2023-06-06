import type { Score as DBScore } from '.prisma/bancho.py'
import { Mode } from '~/types/defs'
import type { ActiveMode, ActiveRuleset, PPRankingSystem } from '~/types/common'
import type { RulesetScore } from '~/types/score'

export function createHitCount<_Mode extends ActiveMode>(
  mode: _Mode,
  score: DBScore
): RulesetScore<unknown, unknown, _Mode, ActiveRuleset, PPRankingSystem>['hit'] {
  return mode === Mode.Mania

    ? ({
        max: score.ngeki,
        300: score.n300,
        200: score.nkatu,
        100: score.n100,
        50: score.n50,
        miss: score.nmiss,
      } as RulesetScore<
        unknown,
        unknown,
        _Mode & Mode.Mania,
        ActiveRuleset,
        PPRankingSystem
      >['hit'])

    : ({
        300: score.n300,
        geki: score.ngeki,
        100: score.n100,
        katu: score.nkatu,
        50: score.n50,
        miss: score.nmiss,
      } as RulesetScore<
        unknown,
        unknown,
        _Mode & Exclude<ActiveMode, Mode.Mania>,
        ActiveRuleset,
        PPRankingSystem
      >['hit'])
}
