import { ArticleProvider as Base } from '$base/server/article'
import type { UserEssential } from '~/def/user'

export class ArticleProvider extends Base {
  async get(opt: { slug: string; fallback?: boolean; user?: UserEssential<unknown> }) {
    const content = await this.getLocal(opt)
    if (!content) {
      return undefined
    }

    const [read, write] = await Promise.all([ArticleProvider.checkPrivilege('read', content, opt.user), ArticleProvider.checkPrivilege('write', content, opt.user)])
    return Object.assign(content, {
      access: {
        read,
        write,
      },
    })
  }

  async save(opt: {
    slug: string
    json: Base.JSONContent
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
