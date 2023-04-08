import type { JSONContent } from '@tiptap/core'
import type { UserEssential } from '../../../types/user'
import type { Id } from '..'
import { ArticleProvider as Base } from '$def/server/article'

export class ArticleProvider extends Base {
  async get(opt: { slug: string; fallback?: boolean; user?: UserEssential<Id> }) {
    return this.getLocal(opt)
  }

  async save(opt: { slug: string; content: JSONContent; user: UserEssential<Id> }) {
    return this.saveLocal(opt)
  }
}
