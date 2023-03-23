import fs from 'fs/promises'
import { isAbsolute, join, relative, resolve } from 'path'
import type { JSONContent } from '@tiptap/core'
import { generateHTML } from '@tiptap/html'
import useEditorExtensions from '~/composables/useEditorExtensions'
interface Content {
  json: JSONContent
  html: string
}
export abstract class ArticleProvider {
  articles = resolve('articles')
  fallbacks = new Map<string, Content>()
  constructor() {
    this.initFallbacks()
  }

  initFallbacks() {
    (['404', '403'] as const).forEach(async (code) => {
      const fb = await this.getLocal(`fallbacks/${code}`)
      if (!fb) {
        return
      }
      this.fallbacks.set(code, fb)
    })
  }

  inside(path: string) {
    const _r = relative(this.articles, path)
    return _r && !_r.startsWith('..') && !isAbsolute(_r)
  }

  abstract get(slug: string, fallback: boolean): Promise<Content | undefined>
  abstract save(slug: string, jsonContent: JSONContent): Promise<void>

  async getLocal(slug: string, fallback = false): Promise<Content | undefined> {
    let file = join(this.articles, slug)
    if (!this.inside(file)) {
      return this.fallbacks.get('403')
    }
    try {
      let check = fs.access(file, fs.constants.R_OK)
      if (fallback) {
        check = check.catch((_) => {
          file = join(this.articles, './fallbacks', slug)
        }).then(() => fs.access(file, fs.constants.R_OK))
      }
      await check
      const content = JSON.parse(await fs.readFile(file, 'utf-8'))
      return {
        json: content,
        html: await this.render(content),
      }
    }
    catch (e) {
      return undefined
    }
  }

  async saveLocal(slug: string, jsonContent: JSONContent): Promise<void> {
    const loc = join(this.articles, slug)
    await fs.writeFile(loc, JSON.stringify(jsonContent), 'utf-8')
  }

  render(jsonContent: JSONContent) {
    const renderExtensions = useEditorExtensions()
    return generateHTML(jsonContent, renderExtensions)
  }
}
