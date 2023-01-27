import { exec } from 'child_process'
import { readdirSync } from 'fs'
import { join, relative } from 'path'
// import { fileURLToPath } from 'url'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = fileURLToPath(new URL('.', import.meta.url))

const root = join(__dirname, '..')

const schemaPath = join(__dirname, '../prisma')

const files = readdirSync(schemaPath)

for (const file of files) {
  const schema = relative(root, join('prisma/', file))
  exec(`npx prisma generate --schema=${schema}`)
}
// series([
//   () => exec('npm run dev'),
//   () => exec('npm run test'),
// ])
