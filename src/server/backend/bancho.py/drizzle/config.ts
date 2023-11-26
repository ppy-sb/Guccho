import { fileURLToPath } from 'node:url'
import type { Config } from 'drizzle-kit'
import guccho from './../../../../../guccho.backend.config'

export default {
  schema: './*',
  // @ts-expect-error nvm
  out: fileURLToPath(new URL('./migrations', import.meta.url)),
  driver: 'mysql2',
  introspect: {
    casing: 'camel',
  },
  dbCredentials: {
    uri: guccho.dsn,
  },
} satisfies Config
