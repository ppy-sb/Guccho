import { exec } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = join(__dirname, '..')
const schemaPath = join(__dirname, '../prisma')

const files = readdirSync(schemaPath)

for (const file of files) {
  const schema = relative(root, join('prisma/', file))
  exec(`npx prisma generate --schema=${schema}`)
}
