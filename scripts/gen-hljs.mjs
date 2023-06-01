import { readdirSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import highlight from 'highlight.js'
import { uneval } from 'devalue'

const __dirname = dirname(fileURLToPath(import.meta.url))

const hljs = {}

const files = readdirSync('./node_modules/highlight.js/es/languages').filter(file => !file.endsWith('.js.js')).map(file => file.slice(0, -3))

;(async () => {
  await Promise.all (files.map(async (file) => {
    const mod = await import(`highlight.js/lib/languages/${file}`)
    const { aliases } = mod.default(highlight)
    const language = file
    hljs[language] = language
    if (!aliases) {
      return
    }
    aliases.forEach((alias) => {
      hljs[alias] = language
    })
  }))

  return writeFile(resolve(__dirname, '../configs/hljs.ts'), `export default ${uneval(hljs)} as const`, {
    flag: 'w',
    encoding: 'utf-8',
  })
})()
