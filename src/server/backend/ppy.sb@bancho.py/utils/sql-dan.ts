import { type SQL, and, eq, gt, gte, inArray, lt, lte, ne, not, or, sql } from 'drizzle-orm'
import { type MySqlColumn } from 'drizzle-orm/mysql-core'
import { toBanchoPyMode } from '../../bancho.py/transforms'
import { hasRuleset } from '../'
import { Mode, Ruleset } from '~/def'
import type * as schema from '~/server/backend/ppy.sb@bancho.py/drizzle/schema'
import {
  type ComparableBigintScoreItem,
  type ComparableNumericalScoreItem,
  type Compare,
  type CompareCheck,
  CompareOP,
  type ComparisonCondition,
  type Cond,
  OP,
  type Requirement,
  type RequirementCondBinding,
} from '~/def/dan'

interface Tables {
  scores: typeof schema.scores
  patcherScoresMeta: typeof schema.patcherScoresMeta
  beatmaps: typeof schema.beatmaps
  sources: typeof schema.sources
}
export function danSQLChunks<C extends Cond, AB extends RequirementCondBinding<Requirement, Cond>>(
  cond: C,
  achievements: readonly AB[],
  table: Tables
): SQL | undefined {
  const { type } = cond
  switch (type) {
    case OP.BeatmapMd5Eq: {
      const { val } = cond
      return eq(table.beatmaps.md5, val)
    }
    case OP.BanchoBeatmapIdEq: {
      return and(
        eq(table.beatmaps.server, sql.raw('\'osu!\'')),
        eq(table.beatmaps.id, sql`${cond.val}`)
      )!
    }
    case OP.AccGte: {
      // const { val } = cond
      // return gte(table.scores.accuracy, val)
      return danSQLChunks({ type: OP.Expect, key: 'accuracy', val: { type: CompareOP.Gte, val: cond.val } }, achievements, table)
    }
    case OP.ScoreGte: {
      // const { val } = cond
      // return gte(table.scores.score, sql`${val}`)
      return danSQLChunks({ type: OP.Expect, key: 'score', val: { type: CompareOP.Gte, val: cond.val } }, achievements, table)
    }
    case OP.NoPause: {
      return eq(table.patcherScoresMeta.noPause, true)
    }
    case OP.StableModIncludeAny: {
      const { val } = cond
      return sql`(${table.scores.mods} & ${val} > 0)`
    }
    case OP.StableModIncludeAll: {
      const { val } = cond
      return sql`(${table.scores.mods} & ${val} = ${val})`
    }
    case OP.ModeEq: {
      // const { val } = cond
      // return or(
      //   eq(table.scores.mode, toBanchoPyMode(val, Ruleset.Standard)),
      //   // cannot use .if() due to toBanchoPyMode will throw Error first
      //   hasRuleset(val, Ruleset.Relax) ? eq(table.scores.mode, toBanchoPyMode(val, Ruleset.Relax)) : undefined,
      //   hasRuleset(val, Ruleset.Autopilot) ? eq(table.scores.mode, toBanchoPyMode(val, Ruleset.Autopilot)) : undefined,
      // )
      return danSQLChunks({ type: OP.Expect, key: 'mode', val: { type: CompareOP.Eq, val: cond.val } }, achievements, table)
    }
    case OP.RulesetEq: {
      // const { val } = cond
      // return inArray(
      //   table.scores.mode,
      //   [
      //     toBanchoPyMode(Mode.Osu, val),
      //     toBanchoPyMode(Mode.Taiko, val),
      //     toBanchoPyMode(Mode.Fruits, val),
      //     toBanchoPyMode(Mode.Mania, val),
      //   ]
      // )
      return danSQLChunks({ type: OP.Expect, key: 'ruleset', val: { type: CompareOP.Eq, val: cond.val } }, achievements, table)
    }
    case OP.Remark: {
      return danSQLChunks(cond.cond, achievements, table)
    }
    case OP.NOT: {
      const _cond = danSQLChunks(cond.cond, achievements, table)
      if (!_cond) {
        return undefined
      }
      return not(_cond)
    }
    case OP.AND: {
      const sqlChunks = cond.cond.map(c => danSQLChunks(c, achievements, table))
      return and(...sqlChunks)!
    }
    case OP.OR: {
      const sqlChunks = cond.cond.map(c => danSQLChunks(c, achievements, table))
      return or(...sqlChunks)!
    }
    case OP.Extends: {
      const { val } = cond
      const _cond = achievements.find(
        ({ type: achievement }) => achievement === val
      )?.cond
        ?? raiseError(
          `extending achievement (${val}) not found`
        )
      if (_cond === cond) {
        raiseError('loop detected')
      }
      return danSQLChunks(_cond, achievements, table)
    }
    case OP.Expect: {
      return getCompareSQL(cond, table)
    }
    default:
      assertNotReachable(type)
  }
}

function getCompareSQL<C extends ComparisonCondition>(cond: C, table: Tables): SQL | undefined {
  switch (cond.key) {
    case 'mode': {
      const val = cond.val.val
      return or(
        eq(table.scores.mode, toBanchoPyMode(val, Ruleset.Standard)),
        // cannot use .if() due to toBanchoPyMode will throw Error first
        hasRuleset(val, Ruleset.Relax) ? eq(table.scores.mode, toBanchoPyMode(val, Ruleset.Relax)) : undefined,
        hasRuleset(val, Ruleset.Autopilot) ? eq(table.scores.mode, toBanchoPyMode(val, Ruleset.Autopilot)) : undefined,
      )
    }

    case 'ruleset':{
      const val = cond.val.val
      return inArray(
        table.scores.mode,
        [
          toBanchoPyMode(Mode.Osu, val),
          toBanchoPyMode(Mode.Taiko, val),
          toBanchoPyMode(Mode.Fruits, val),
          toBanchoPyMode(Mode.Mania, val),
        ]
      )
    }
    default: {
      return getCompareFunctionSQL(cond, getCompareValueSQL(cond, table))
    }
  }
}

type UN = Compare<ComparableNumericalScoreItem, CompareCheck<number>> | Compare<ComparableBigintScoreItem, CompareCheck<bigint>>
function getCompareValueSQL<C extends UN>(cond: C, tables: Tables) {
  switch (cond.key) {
    // case 'mode': return tables.scores.mode
    // case 'ruleset': return tables.scores.ruleset
    case 'score': return tables.scores.score
    case 'accuracy': return tables.scores.accuracy
    case 'maxCombo': return tables.scores.maxCombo
    case 'count.miss': return tables.scores.nMiss
    case 'count.50': return tables.scores.n50
    case 'count.100': return tables.scores.n100
    case 'count.300':return tables.scores.n300

    case 'count.geki':
    case 'count.200':
      return tables.scores.nGeki

    case 'count.max':
    case 'count.katu':
      return tables.scores.nKatu

    default:
      assertNotReachable(cond)
  }
}
function getCompareFunctionSQL(cond: UN, value: MySqlColumn): SQL<unknown> | undefined {
  switch (cond.val.type) {
    case CompareOP.Gt:
      return gt(value, cond.val.val)
    case CompareOP.Lt:
      return lt(value, cond.val.val)
    case CompareOP.Eq:
      return eq(value, cond.val.val)
    case CompareOP.Ne:
      return ne(value, cond.val.val)
    case CompareOP.Gte:
      return gte(value, cond.val.val)
    case CompareOP.Lte:
      return lte(value, cond.val.val)
    default:
      assertNotReachable(cond.val)
  }
}
