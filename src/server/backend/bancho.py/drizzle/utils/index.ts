/**
 * Here you can write any utilities you want to use in the playground
 * 💡Tip: you can use the `$` global variable to access goodies
 */

import { type AnyColumn, type SQL, and, sql } from 'drizzle-orm'
import { type SelectedFields } from 'drizzle-orm/mysql-core'
import { type SelectResultFields } from 'drizzle-orm/query-builders/select.types'

export function jsonObject<T extends SelectedFields>(shape: T) {
  const chunks: SQL[] = []

  Object.entries(shape).forEach(([key, value]) => {
    if (chunks.length > 0) {
      chunks.push(sql.raw(','))
    }

    chunks.push(sql.raw(`'${key}',`))

    // // json_build_object formats to ISO 8601 ...
    // if (is(value, PgTimestampString)) {
    //   chunks.push(sql`timezone('UTC', ${value})`)
    // }
    // else {
    //   chunks.push(sql`${value}`)
    // }
    chunks.push(sql`${value}`)
  })

  return sql<SelectResultFields<T>>`JSON_OBJECT(${sql.join(chunks)})`
}

export function jsonArrayAggObject<
  T extends SelectedFields,
  Column extends AnyColumn,
>(
  shape: T,
  options?: { orderBy?: { colName: Column; direction: 'ASC' | 'DESC' } },
) {
  return sql<SelectResultFields<T>[]>`coalesce(
    JSON_ARRAYAGG(${jsonObject(shape)}
    ${options?.orderBy
      ? sql`ORDER BY ${options.orderBy.colName} ${sql.raw(
        options.orderBy.direction,
      )}`
      : undefined
    })
    FILTER (WHERE ${and(
      sql.join(
        Object.values(shape).map(value => sql`${sql`${value}`} IS NOT NULL`),
        sql` AND `,
      ),
    )})
    ,'${sql`[]`}')`
}
