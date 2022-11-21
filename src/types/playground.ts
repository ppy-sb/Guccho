import { SWITCH, CASE, DEFAULT, EQUALS } from './internal-utils'
import { Ruleset, StandardAvailable, RelaxAvailable, AutopilotAvailable } from './common'

type AutoAvailable<_Ruleset extends Ruleset> =
  // _Ruleset extends StandardAvailable
  //   ? StandardAvailable
  //   : _Ruleset extends RelaxAvailable
  //   ? RelaxAvailable
  //   : _Ruleset extends AutopilotAvailable
  //   ? AutopilotAvailable
  //   : never;

  SWITCH<_Ruleset,
    | CASE<'standard', StandardAvailable>
    | CASE<'relax', RelaxAvailable>
    | CASE<'autopilot', AutopilotAvailable>
    | DEFAULT<never>
  >

  type D<IP extends Ruleset>= EQUALS<AutoAvailable<IP>>
