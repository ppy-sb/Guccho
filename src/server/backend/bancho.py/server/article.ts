import type { UserEssential } from '~/types/user'
import { ArticleProvider as Base } from '$def/server/article'

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

  async save(opt: {
    slug: string
    content: Base.JSONContent
    user: UserEssential<unknown>
    privilege: Base.Meta['privilege']
    dynamic: boolean
  }) {
    return this.saveLocal(opt)
  }
}
export namespace ArticleProvider {
  export type JSONContent = Base.JSONContent
}
