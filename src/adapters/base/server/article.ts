import fs from 'fs/promises'
import { join, resolve } from 'path'
import type { JSONContent } from '@tiptap/core'
import { generateHTML } from '@tiptap/html'
import useEditorExtensions from '~/composables/useEditorExtensions'
interface Content {
  json: JSONContent
  html: string
}
export abstract class ArticleProvider {
  articles = resolve('articles')
  404: Content
  constructor() {
    this.initFallbacks()
  }

  async initFallbacks() {
    const fb = await this.getLocal('fallbacks/404')
    if (!fb) {
      return
    }
    this[404] = fb
  }

  abstract get(slug: string, fallback: boolean): Promise<Content | undefined>
  abstract save(slug: string, jsonContent: JSONContent): Promise<void>

  async getLocal(slug: string, fallback = false): Promise<Content | undefined> {
    let file = join(this.articles, slug)
    try {
      const check = fs.access(file, fs.constants.R_OK)
      if (fallback) {
        check.catch(_ => file = join(this.articles, 'fallbacks', slug))
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
