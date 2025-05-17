import { type ScoreCompact, type StableMod } from './score'
import { type BeatmapCompact } from './beatmap'
import type { UserCompact } from './user'
import { type Mode, type Ruleset } from '.'

// =============================
// Core Types
// =============================

interface WithId<I> {
  id: I
}

export enum Requirement {
  Pass = 'pass',
  NoPause = 'no-pause',
}

// =============================
// Operators & Conditions
// =============================

export enum OP {
  // Logical operators
  AND = 'and',
  OR = 'or',
  NOT = 'not',

  // Special operators
  Remark = 'rem',
  Expect = 'expect',
  Extends = 'extends',

  // Game-specific operators
  ModeEq = 'mode-eq',
  RulesetEq = 'ruleset-eq',
  BanchoBeatmapIdEq = 'bancho/bm-id-eq',
  BeatmapMd5Eq = 'bm-md5-eq',
  NoPause = 'no-pause',
  AccGte = 'acc-gte',
  ScoreGte = 'score-gte',
  StableModIncludeAny = 'stable/mod-contains-any',
  StableModIncludeAll = 'stable/mod-contains-all',
}

export enum CompareOP {
  // Comparison operators
  Gt = 'gt',
  Gte = 'gte',
  Lt = 'lt',
  Lte = 'lte',
  Eq = 'eq',
  Ne = 'ne',
}

// Base condition types
export interface CondBase<O> {
  type: O
}

export interface ConcreteCond<O, V> extends CondBase<O> {
  val: V
}

export interface WrappedCond<O, C> extends CondBase<O> {
  cond: C
}

export interface Remarked<O, V> extends WrappedCond<O, V> {
  remark: string
}

export interface Compare<VKey, VInput> extends CondBase<OP> {
  type: OP.Expect
  key: VKey
  input: VInput
}

// Operator type extractions
export type ConcreteCondOP = ConcreteCondition['type']
type DeepCondOP = LogicalCondition['type']
type WrappingCondOP = WrappedCondition['type']
type ExtendingCondOP = ExtendingCond['type']

// =============================
// Comparable Score Items
// =============================

export type ComparableNumericalScoreItem =
  | 'accuracy'
  | 'maxCombo'
  | 'count.miss'
  | 'count.50'
  | 'count.100'
  | 'count.300'
  | 'count.geki'
  | 'count.katu'
  | 'count.200'
  | 'count.max'

export type ComparableBigintScoreItem = 'score'

// =============================
// Condition Combinations
// =============================

export type ConcreteCondition =
  | ConcreteCond<OP.BanchoBeatmapIdEq, string>
  | ConcreteCond<OP.BeatmapMd5Eq, string>
  | ConcreteCond<OP.AccGte, number>
  | ConcreteCond<OP.ScoreGte, bigint>
  | ConcreteCond<OP.StableModIncludeAny, StableMod>
  | ConcreteCond<OP.StableModIncludeAll, StableMod>
  | ConcreteCond<OP.ModeEq, Mode>
  | ConcreteCond<OP.RulesetEq, Ruleset>
  | CondBase<OP.NoPause>

type WrappedCondition =
  | WrappedCond<OP.NOT, Cond>
  | Remarked<OP.Remark, Cond>

type LogicalCondition =
  | WrappedCond<OP.AND, readonly Cond[]>
  | WrappedCond<OP.OR, readonly Cond[]>

type ExtendingCond = ConcreteCond<OP.Extends, Requirement>

export type CompareCheck<T> =
  | ConcreteCond<CompareOP.Gt, T>
  | ConcreteCond<CompareOP.Gte, T>
  | ConcreteCond<CompareOP.Lt, T>
  | ConcreteCond<CompareOP.Lte, T>
  | ConcreteCond<CompareOP.Eq, T>
  | ConcreteCond<CompareOP.Ne, T>

export type EqualityCheck<V> =
  | ConcreteCond<CompareOP.Eq, V>
  | ConcreteCond<CompareOP.Ne, V>

export type ComparisonCondition =
  | Compare<ComparableNumericalScoreItem, CompareCheck<number>>
  | Compare<ComparableBigintScoreItem, CompareCheck<bigint>>
  | Compare<'mode', EqualityCheck<Mode>>
  | Compare<'ruleset', EqualityCheck<Ruleset>>

export type ComputedCondition =
  | LogicalCondition
  | ExtendingCond
  | ComparisonCondition

export type Cond =
  | ConcreteCondition
  | WrappedCondition
  | ComputedCondition

// =============================
// Dan Requirements & Results
// =============================

export interface RequirementCondBinding<R, C> {
  type: R
  cond: C
}

export interface DatabaseRequirementCondBinding<_I, R, C> extends RequirementCondBinding<R, C> {
  // dan: _I - unused but kept for consistency with other database types
}

export type DetailResult<
  C extends Cond = Cond,
  AB extends RequirementCondBinding<Requirement, Cond> = RequirementCondBinding<Requirement, Cond>,
> = C extends ConcreteCond<infer _R extends ExtendingCondOP, infer _T extends Requirement>
  ? {
      cond: C
      result: boolean
      detail: DetailResult<Cond, AB>
    }
  : C extends ConcreteCondition
    ? {
        cond: C
        result: boolean
        value: C extends ConcreteCond<infer _O, infer _V> ? _V : never
      }
    : C extends WrappedCond<infer _R extends WrappingCondOP, infer T extends Cond>
      ? {
          cond: C
          result: boolean
          detail: DetailResult<T, AB>
        }
      : C extends WrappedCond<infer R extends DeepCondOP, infer T extends readonly Cond[]>
        ? {
            cond: WrappedCond<R, T>
            result: boolean
            detail: {
              [k in keyof T]: DetailResult<T[k], AB>
            }
          }
        : never

// =============================
// Domain Models
// =============================

export interface Dan<RCBinding extends RequirementCondBinding<Requirement, Cond> = RequirementCondBinding<Requirement, Cond>> {
  name: string
  description: string
  requirements: readonly RCBinding[]
}

export interface DatabaseDan<I, RCBinding extends DatabaseRequirementCondBinding<I, Requirement, Cond> = DatabaseRequirementCondBinding<I, Requirement, Cond>> extends Dan<RCBinding>, WithId<I> {
  creator?: I
  updater?: I
  createdAt: Date
  updatedAt: Date
}

export interface DatabaseDanCourse<I, RCBinding extends DatabaseRequirementCondBinding<I, Requirement, Cond> = DatabaseRequirementCondBinding<I, Requirement, Cond>> extends WithId<I> {
  name: string
  description: string
  creator?: I
  updater?: I
  createdAt: Date
  updatedAt: Date
  dans: Array<DatabaseDan<I, RCBinding> & { shortName: string }>
}

// =============================
// Score Validation
// =============================

export type ValidatingScore = ScoreCompact<any, Mode> & {
  beatmap: BeatmapCompact<any, any>
  noPause: boolean
  player: Pick<UserCompact<any>, 'id' | 'name' | 'safeName'>
  mode: Mode
  ruleset: Ruleset
}

export type RequirementResult<AB extends RequirementCondBinding<Requirement, Cond> = RequirementCondBinding<Requirement, Cond>> =
  AB extends RequirementCondBinding<infer A extends Requirement, infer C extends Cond>
    ? {
        type: A
        result: boolean
        detail: DetailResult<C, AB>
      }
    : never

export type DatabaseRequirementResult<
  I,
  RCBinding extends DatabaseRequirementCondBinding<I, Requirement, Cond> = DatabaseRequirementCondBinding<I, Requirement, Cond>,
> = RequirementResult<RCBinding> & WithId<I>
