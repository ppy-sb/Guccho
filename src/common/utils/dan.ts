import { $enum } from 'ts-enum-util'
import { BeatmapSource } from '~/def/beatmap'
import {
  type ConcreteCond,
  type Cond,
  type Dan,

  type DetailResult,
  OP,
  Requirement,
  type RequirementCondBinding,
  type RequirementResult,
  type ValidatingScore,
} from '~/def/dan'
import { type StableMod } from '~/def/score'

const $req = $enum(Requirement)

export type TransformedUsecase<AB extends RequirementCondBinding<Requirement, Cond>> = (score: ValidatingScore, runtimeCtx?: TransformedRuntimeContext<AB>) => RequirementResult<AB>[]

type CondHash = ReturnType<typeof getHash>

interface TransformContext<AB extends RequirementCondBinding<Requirement, Cond>> {
  transformed: Map<CondHash, TransformedCond<AB>>
  achievements: readonly AB[]
}

interface TransformedRuntimeContext<AB extends RequirementCondBinding<Requirement, Cond>> {
  results: Map<CondHash, DetailResult<Cond, AB>>
}

interface JITContext<AB extends RequirementCondBinding<Requirement, Cond>> extends TransformedRuntimeContext<AB> {
  achievements: readonly AB[]
}

export type TransformedCond<AB extends RequirementCondBinding<Requirement, Cond>> = (
  score: ValidatingScore,
  runtimeCtx: TransformedRuntimeContext<AB>
) => DetailResult<Cond, AB>

export function transformUsecase<AB extends RequirementCondBinding<Requirement, Cond>>(
  usecase: Dan<AB>,
): TransformedUsecase<AB> {
  const transformCtx: TransformContext<AB> = {
    transformed: new Map(),
    achievements: usecase.requirements,
  }
  const transformed: Array<{
    ach: Requirement
    run: TransformedCond<AB>
  }> = []
  for (const { type: achievement, cond: check_cond } of usecase.requirements) {
    const r = transformCond(check_cond, transformCtx)
    transformCtx.transformed.set(getHash(check_cond), r)
    transformed.push({
      ach: achievement,
      run: r,
    })
  }

  return (score, runtimeCtx = { results: new Map() }) => {
    const check_result: RequirementResult<AB>[] = []
    for (const { ach, run } of transformed) {
      const r = run(score, runtimeCtx)
      check_result.push({
        achievement: ach,
        result: r.result,
        detail: r,
      } as unknown as RequirementResult<AB>)
    }

    return check_result
  }
}

export function transformCond<AB extends RequirementCondBinding<Requirement, Cond>>(
  cond: Cond,
  transformCtx: TransformContext<AB>
): TransformedCond<AB> {
  const hashed = getHash(cond)
  const cached = transformCtx.transformed.get(hashed)
  if (cached) {
    return cached
  }
  const result = transformCondNoCache(cond, transformCtx)
  transformCtx.transformed.set(hashed, result)
  return cacheResult(result)
}

export function runUsecase<AB extends RequirementCondBinding<Requirement, Cond>>(
  usecase: Dan<AB>,
  score: ValidatingScore
): RequirementResult<AB>[] {
  const checkResult: RequirementResult<AB>[] = []
  const results: Map<ReturnType<typeof getHash>, DetailResult<Cond, AB>> = new Map()
  for (const { type: achievement, cond: checkingCond } of usecase.requirements) {
    const r = runCond(checkingCond, score, { achievements: usecase.requirements, results })
    checkResult.push({
      achievement,
      result: r.result,
      detail: r,
    } as unknown as RequirementResult<AB>)
  }
  return checkResult
}

export function runCond<AB extends RequirementCondBinding<Requirement, Cond>>(
  cond: Cond,
  score: ValidatingScore,
  ctx: JITContext<AB>
): DetailResult<Cond, AB> {
  const hashed = getHash(cond)
  const cached = ctx.results.get(hashed)
  if (cached) {
    return cached
  }

  const res = runCondNoCache(cond, score, ctx)
  ctx.results.set(hashed, res)
  return res
}

function transformCondNoCache<AB extends RequirementCondBinding<Requirement, Cond>>(
  cond: Cond,
  transformCtx: TransformContext<AB>
): TransformedCond<AB> {
  switch (cond.type) {
    case OP.Remark: {
      const { remark, cond: _cond } = cond
      const _deep = transformCond<AB>(_cond, transformCtx)
      return (score, runtimeCtx) => {
        const result = _deep(score, runtimeCtx)
        return {
          cond,
          remark,
          result: result.result,
          detail: result,
        } as DetailResult<Cond, AB>
      }
    }
    case OP.NOT: {
      const { cond: not } = cond
      const _deep = transformCond<AB>(not, transformCtx)
      return (score, runtimeCtx) => {
        const result = _deep(score, runtimeCtx)
        return {
          cond,
          result: !result.result,
          detail: result,
        } as DetailResult<Cond, AB>
      }
    }
    case OP.AND: {
      const _deep = cond.cond.map(c => transformCond<AB>(c, transformCtx))
      return (score, runtimeCtx) => {
        const _results = _deep.map(p => p(score, runtimeCtx))
        return {
          cond,
          result: _results.every(r => r.result),
          detail: _results,
        } as DetailResult<Cond, AB>
      }
    }
    case OP.OR: {
      const _deep = cond.cond.map(c => transformCond<AB>(c, transformCtx))
      return (score, runtimeCtx) => {
        const _results = _deep.map(p => p(score, runtimeCtx))
        return {
          cond,
          result: _results.some(r => r.result),
          detail: _results,
        } as DetailResult<Cond, AB>
      }
    }
    case OP.Extends: {
      const { val } = cond
      const compileTimeFoundCond = transformCtx.achievements.find(({ type: achievement }) => achievement === val)?.cond

      if (!compileTimeFoundCond) {
        console.warn(`extending achievement (${$req.getKeyOrDefault(val)}) not found during compile time.`)
      }

      // pre-compile the extending achievement
      if (compileTimeFoundCond) {
        transformCond<AB>(compileTimeFoundCond, transformCtx)
      }

      return (score, runtimeCtx) => {
        let extendingCond: Cond
        if (compileTimeFoundCond) {
          extendingCond = compileTimeFoundCond
        }
        else {
          extendingCond = transformCtx.achievements.find(({ type: achievement }) => achievement === val)?.cond
            ?? raiseError(`extending achievement (${$req.getKeyOrDefault(val)}) not found`)
        }

        const result = transformCond<AB>(extendingCond, transformCtx)(score, runtimeCtx)
        return {
          cond,
          result: result.result,
          detail: result,
        } as unknown as DetailResult<ConcreteCond<OP.Extends, Requirement>, AB>
      }
    }
    default: {
      const jit = { achievements: transformCtx.achievements }
      return (score, ctx) => runCondNoCache(cond, score, Object.assign(jit, ctx))
    }
  }
}

function runCondNoCache<AB extends RequirementCondBinding<Requirement, Cond>>(
  cond: Cond,
  score: ValidatingScore,
  ctx: JITContext<AB>
): DetailResult<Cond, AB> {
  const { type } = cond
  switch (type) {
    case OP.BeatmapMd5Eq: {
      const { val } = cond
      return {
        cond,
        result: score.beatmap.md5 === val,
        value: score.beatmap.md5,
      } as DetailResult<Cond, AB>
    }
    case OP.BanchoBeatmapIdEq: {
      if (score.beatmap.source !== BeatmapSource.Bancho) {
        return {
          cond,
          result: false,
        } as DetailResult<Cond, AB>
      }
      const { val } = cond
      return {
        cond,
        result: score.beatmap.foreignId === val,
        value: score.beatmap.foreignId,
      } as DetailResult<Cond, AB>
    }
    case OP.AccGte: {
      const { val } = cond
      return {
        cond,
        result: score.accuracy >= val,
        value: score.accuracy,
      } as DetailResult<Cond, AB>
    }
    case OP.ScoreGte: {
      const { val } = cond
      return {
        cond,
        result: score.score >= val,
        value: score.score,
      } as DetailResult<Cond, AB>
    }
    case OP.NoPause: {
      return {
        cond,
        result: score.noPause,
        value: score.noPause,
      } as DetailResult<Cond, AB>
    }
    case OP.StableModIncludeAny: {
      const { val } = cond
      const stbMod = mergeStableMods(score.mods)
      return {
        cond,
        result: (stbMod & val) !== 0,
        value: val,
      } as DetailResult<Cond, AB>
    }
    case OP.StableModIncludeAll: {
      const { val } = cond
      const stbMod = mergeStableMods(score.mods)
      return {
        cond,
        result: (stbMod & val) === val,
        value: val,
      } as DetailResult<Cond, AB>
    }
    case OP.ModeEq: {
      const { val } = cond
      return {
        cond,
        result: score.mode === val,
        value: val,
      } as DetailResult<Cond, AB>
    }
    case OP.RulesetEq: {
      const { val } = cond
      return {
        cond,
        result: score.ruleset === val,
        value: val,
      } as DetailResult<Cond, AB>
    }
    case OP.Remark: {
      const { remark, cond: _cond } = cond
      const _result = runCond(_cond, score, ctx)
      return {
        cond,
        remark,
        result: _result.result,
        detail: _result,
      } as unknown as DetailResult<Cond, AB>
    }
    case OP.NOT: {
      const { cond: not } = cond
      const _result = runCond(not, score, ctx)
      return {
        cond,
        result: !_result.result,
        detail: _result,
      } as DetailResult<Cond, AB>
    }
    case OP.AND: {
      const _results = cond.cond.map(c =>
        runCond(c, score, ctx)
      )
      return {
        cond,
        result: _results.every(r => r.result),
        detail: _results,
      } as unknown as DetailResult<Cond, AB>
    }
    case OP.OR: {
      const _results = cond.cond.map(c =>
        runCond(c, score, ctx)
      )
      return {
        cond,
        result: _results.some(r => r.result),
        detail: _results,
      } as unknown as DetailResult<Cond, AB>
    }
    case OP.Extends: {
      const { val } = cond
      const extendingCond
        = ctx.achievements.find(
          ({ type: achievement }) => achievement === val
        )?.cond
        ?? raiseError(
          `extending achievement (${$req.getKeyOrDefault(val)}) not found`
        )
      const extendingCondResult = runCond(extendingCond, score, ctx)
      return {
        cond,
        result: extendingCondResult.result,
        detail: extendingCondResult,
      } as unknown as DetailResult<Cond, AB>
    }
    default:
      assertNotReachable(type)
  }
}

export function validateCond<T extends Cond>(cond: T): T {
  switch (cond.type) {
    case OP.BanchoBeatmapIdEq:
    case OP.BeatmapMd5Eq:
    case OP.AccGte:
    case OP.ScoreGte:
    case OP.ModeEq:
    case OP.StableModIncludeAny:
    case OP.StableModIncludeAll:
    case OP.RulesetEq:
    case OP.Extends:
      return { type: cond.type, val: cond.val } as T

    case OP.Remark:
      return { type: cond.type, remark: cond.remark, cond: validateCond(cond.cond) } as T

    case OP.NoPause:
      return { type: cond.type } as T
    case OP.NOT:
      return { type: cond.type, cond: validateCond(cond.cond) } as T

    case OP.OR:
    case OP.AND:
      return { type: cond.type, cond: cond.cond.filter(Boolean).map(validateCond) } as unknown as T

    default: assertNotReachable(cond)
  }
}

export function validateUsecase<U extends Dan>(compose: U): U {
  return {
    ...compose,
    requirements: compose.requirements.map(i => ({
      ...i,
      cond: validateCond(i.cond),
    })),
  }
}

function mergeStableMods(mods: StableMod[]): StableMod {
  return mods.reduce((a, b) => a | b, 0 as StableMod)
}

function getHash(cond: Cond): string {
  switch (cond.type) {
    case OP.BanchoBeatmapIdEq:
    case OP.BeatmapMd5Eq:
    case OP.AccGte:
    case OP.ScoreGte:
    case OP.ModeEq:
    case OP.StableModIncludeAny:
    case OP.StableModIncludeAll:
    case OP.RulesetEq:
    case OP.Extends:
      return `${cond.type}:${cond.val}`
    case OP.NoPause:
      return cond.type
    case OP.NOT:
      return `${cond.type}:${getHash(cond.cond)}`
    case OP.Remark:
      return `${cond.type}:${cond.remark}:${getHash(cond.cond)}`
    case OP.AND:
    case OP.OR:
      // Sort to ensure order-independence
      return `${cond.type}:${cond.cond.map(getHash).sort().join('&')}`
    default:
      return assertNotReachable(cond)
  }
}

function cacheResult<T extends TransformedCond<RequirementCondBinding<Requirement, Cond>>>(cb: T): T {
  return ((score: ValidatingScore, runtimeCtx) => {
    const result = cb(score, runtimeCtx)
    runtimeCtx.results.set(getHash(result.cond), result)
    return result
  }) as T
}
