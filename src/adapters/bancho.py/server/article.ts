import type { JSONContent } from '@tiptap/core'
import { ArticleProvider as Base } from '$def/server/article'
export class ArticleProvider extends Base {
  async get(slug: string, fallback = false) {
    return this.getLocal(slug, fallback)
  }

  async save(slug: string, content: JSONContent) {
    return this.saveLocal(slug, content)
  }
}
