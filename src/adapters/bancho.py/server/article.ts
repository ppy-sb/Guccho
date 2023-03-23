import type { JSONContent } from '@tiptap/core'
import { ArticleProvider as Base } from '$def/server/article'
export class ArticleProvider extends Base {
  async get(slug: string) {
    return undefined
  }

  async save(slug: string, content: JSONContent) {

  }
}
