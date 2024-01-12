import { fileURLToPath } from 'node:url'
import path from 'node:path'
import type { Config } from 'drizzle-kit'
import guccho from './../../../../../guccho.backend.config'

const migrationsPath = fileURLToPath(new URL('./migrations', import.meta.url))
// Remove after this bug is fixed: https://github.com/drizzle-team/drizzle-kit-mirror/issues/81
// eslint-disable-next-line n/prefer-global/process
const migrationsRelativePath = path.relative(process.cwd(), migrationsPath)

export default {
  schema: fileURLToPath(new URL('./schema.ts', import.meta.url)),
  out: migrationsRelativePath,
  driver: 'mysql2',
  introspect: {
    casing: 'camel',
  },
  dbCredentials: {
    uri: guccho.dsn,
  },
} satisfies Config
