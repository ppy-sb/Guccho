import { match } from 'switch-pattern'
import { BanchoMode, BanchoPyMode } from '../enums'
import { Mode, Ruleset } from '~/def'
import type { ActiveMode, ActiveRuleset } from '~/def/common'

export const BPyMode = {
  [BanchoPyMode.OsuStandard]: [Mode.Osu, Ruleset.Standard],
  [BanchoPyMode.TaikoStandard]: [Mode.Taiko, Ruleset.Standard],
  [BanchoPyMode.FruitsStandard]: [Mode.Fruits, Ruleset.Standard],
  [BanchoPyMode.ManiaStandard]: [Mode.Mania, Ruleset.Standard],
  [BanchoPyMode.OsuRelax]: [Mode.Osu, Ruleset.Relax],
  [BanchoPyMode.TaikoRelax]: [Mode.Taiko, Ruleset.Relax],
  [BanchoPyMode.FruitsRelax]: [Mode.Fruits, Ruleset.Relax],
  [BanchoPyMode.OsuAutopilot]: [Mode.Osu, Ruleset.Autopilot],
} as const

// const BPyModeEntries = strictEntries(BPyMode)
const BPyModeEntries = Object.entries(BPyMode)

export function toBanchoPyMode(
  mode: ActiveMode,
  ruleset: ActiveRuleset
): BanchoPyMode {
  const patterns = match([mode, ruleset] as const)

  const str = BPyModeEntries.find(([_, mr]) => patterns.exact(mr))?.[0]
  if (!str) {
    throw new Error('not supported')
  }
  return Number.parseInt(str)
}
export function fromBanchoPyMode<BMode extends BanchoPyMode>(input: BMode): readonly [Mode, Ruleset] {
  return BPyMode[input]
}

export function assertIsBanchoPyMode(val: number): asserts val is BanchoPyMode {
  if (!(val in BPyMode)) {
    throw new Error('unknown bancho.py mode')
  }
}

export function toBanchoMode(mode: Mode) {
  switch (mode) {
    case Mode.Osu:
      return BanchoMode.Osu
    case Mode.Taiko:
      return BanchoMode.Taiko
    case Mode.Fruits:
      return BanchoMode.Fruits
    case Mode.Mania:
      return BanchoMode.Mania
  }
}
export function fromBanchoMode(mode: BanchoMode) {
  switch (mode) {
    case BanchoMode.Osu:
      return Mode.Osu
    case BanchoMode.Taiko:
      return Mode.Taiko
    case BanchoMode.Fruits:
      return Mode.Fruits
    case BanchoMode.Mania:
      return Mode.Mania
  }
}
