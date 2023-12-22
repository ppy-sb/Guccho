import { type MySql2DrizzleConfig, drizzle } from 'drizzle-orm/mysql2'
import { sql } from 'drizzle-orm'
import type * as _schema from '../../drizzle/schema'
import { BanchoPyPrivilege } from '../../enums'
import mysql2 from './mysql2'

export function useDrizzle<T extends Record<string, unknown>>(schema: T, opt?: Partial<MySql2DrizzleConfig<T>>) {
  return mysql2().then(conn => drizzle(conn, { mode: 'default', schema, ...opt }))
}

export const userPriv = (schema: typeof _schema['users']) => sql`${schema.priv} & ${sql.raw(`${BanchoPyPrivilege.Normal | BanchoPyPrivilege.Verified} = ${BanchoPyPrivilege.Normal | BanchoPyPrivilege.Verified}`)}`
