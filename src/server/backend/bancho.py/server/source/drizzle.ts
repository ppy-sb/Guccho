import { drizzle } from 'drizzle-orm/mysql2'
import { sql } from 'drizzle-orm'
import * as schema from '../../drizzle/schema'
import { BanchoPyPrivilege } from '../../enums'
import mysql2 from './mysql2'

export default function<T extends Record<string, unknown>>(schema: T) {
  return mysql2().then(conn => drizzle(conn, { mode: 'default', schema }))
}

export const userPriv = sql`${schema.users.priv} & ${BanchoPyPrivilege.Normal | BanchoPyPrivilege.Verified} = ${BanchoPyPrivilege.Normal | BanchoPyPrivilege.Verified}`
