import { type Column, type SQL, sql } from 'drizzle-orm'

export function jsonArrayAgg<T>(i: SQL<T>): SQL<T[]> {
  return sql`JSON_ARRAYAGG(${i})`
}

export function jsonObject<T extends Record<string, unknown>>(input: T): SQL<{
  [K in keyof T]: T[K] extends SQL<infer U> ? U : T[K] extends Column<infer U> ? U['data'] : T[K];
}> {
  const q = [
    sql`JSON_OBJECT(`,
    ...Object.entries(input).map(([k, v], i, a) => {
      const r = [
        sql.raw(`'${k}'`),
        sql.raw(', '),
        sql`${v}`,
      ]
      if (i < a.length - 1) {
        r.push(sql.raw(', '))
      }
      return r
    }).flat(),
    sql.raw(')'),
  ]

  return sql.join(q) as any
}
