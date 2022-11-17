/* eslint-disable @typescript-eslint/no-var-requires */
import { readdirSync } from 'fs'
import highlight from 'highlight.js'

const hljs: Record<string, string> = {}

const files = readdirSync('./node_modules/highlight.js/es/languages').filter(file => !file.endsWith('.js.js'))

files.forEach((file) => {
  const module = require(`../node_modules/highlight.js/es/languages/${file}`)
  const { aliases } = module(highlight)
  const language = `#${file.slice(0, -3)}`
  hljs[language] = language
  if (!aliases) { return }
  aliases.forEach((alias: string) => {
    hljs[`#${alias}`] = language
  })
})

export default hljs
