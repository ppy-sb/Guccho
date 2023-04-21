import { readdirSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import highlight from 'highlight.js'

const hljs: Record<string, string> = {}

const files = readdirSync('./node_modules/highlight.js/es/languages').filter(file => !file.endsWith('.js.js')).map(file => file.slice(0, -3))

;(async () => {
  await Promise.all (files.map(async (file) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(`highlight.js/lib/languages/${file}`)
    const { aliases } = mod(highlight)
    const language = `#${file}`
    hljs[language] = language
    if (!aliases) {
      return
    }
    aliases.forEach((alias: string) => {
      hljs[`#${alias}`] = language
    })
  }))

  return writeFile(resolve(__dirname, '../configs/hljs.json'), JSON.stringify(hljs), {
    flag: 'w',
    encoding: 'utf-8',
  })
})()
