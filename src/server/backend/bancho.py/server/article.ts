import type { JSONContent } from '@tiptap/core'
import type { UserEssential } from '~/types/user'
import type { ContentPrivilege } from '~/server/backend/@base/server/article'
import { ArticleProvider as Base } from '~/server/backend/@base/server/article'

export class ArticleProvider extends Base {
  async get(opt: { slug: string; fallback?: boolean; user?: UserEssential<unknown> }) {
    const content = await this.getLocal(opt)
    if (!content) {
      return undefined
    }
    const returnValue = Object.assign(content, {
      access: {
        read: false,
        write: false,
      },
    })
    const write = this.checkPrivilege('write', content, opt.user)
    returnValue.access.read = true
    returnValue.access.write = await write

    return returnValue
  }

  async save(opt: { slug: string; content: JSONContent; user: UserEssential<unknown>; privilege: ContentPrivilege['privilege'] }) {
    return this.saveLocal(opt)
  }
}
