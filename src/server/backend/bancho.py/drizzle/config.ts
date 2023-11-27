import { fileURLToPath } from 'node:url'
import type { Config } from 'drizzle-kit'
import guccho from './../../../../../guccho.backend.config'

export default {
  schema: fileURLToPath(new URL('./schema.ts', import.meta.url)),
  out: fileURLToPath(new URL('./migrations', import.meta.url)),
  driver: 'mysql2',
  introspect: {
    casing: 'camel',
  },
  dbCredentials: {
    uri: guccho.dsn,
  },
} satisfies Config
