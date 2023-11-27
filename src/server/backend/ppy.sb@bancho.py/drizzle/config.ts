import { fileURLToPath } from 'node:url'
import conf from '../../bancho.py/drizzle/config'

export default {
  ...conf,
  schema: fileURLToPath(new URL('./schema.ts', import.meta.url)),
  out: fileURLToPath(new URL('./migrations', import.meta.url)),
}
