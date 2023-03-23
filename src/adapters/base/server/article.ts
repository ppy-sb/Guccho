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
  async slug(slug: string): Promise<Content | undefined> {
    return await this.getLocal(slug) || await this.get(slug)
  }

  abstract get(slug: string): Promise<Content | undefined>
  abstract save(slug: string, jsonContent: JSONContent): Promise<void>

  async getLocal(slug: string): Promise<Content | undefined> {
    const file = resolve(join('articles', slug))
    try {
      await fs.access(file, fs.constants.R_OK)
      const content = JSON.parse(await fs.readFile(file, 'utf-8'))
      return {
        json: content,
        html: await this.render(content),
      }
    }
    catch (e) {
      return {
        json: {},
        html: '',
      }
    }
  }

  async saveLocal(slug: string, jsonContent: JSONContent): Promise<void> {
    const loc = resolve(join('articles', slug))
    await fs.writeFile(loc, JSON.stringify(jsonContent), 'utf-8')
  }

  render(jsonContent: JSONContent) {
    const renderExtensions = useEditorExtensions()
    return generateHTML(jsonContent, renderExtensions)
  }
}
