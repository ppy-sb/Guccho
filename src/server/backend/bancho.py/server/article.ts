import { ArticleProvider as Base } from '$base/server/article'
import { type Lang } from '~/def'
import type { UserCompact } from '~/def/user'

export class ArticleProvider extends Base {
  async get(opt: { slug: Base.Slug; fallback: boolean; user?: UserCompact<unknown>; lang: Lang }) {
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

  async editorGet(opt: { slug: Base.Slug; fallback: boolean; user?: UserCompact<unknown>; lang: Lang }) {
    const data = await Base.getLocalArticleData(this.toPath(opt.slug))
    if (!data) {
      return undefined
    }
    const content = ArticleProvider.validate(data, { file: this.toPath(opt.slug), tryUpdate: true, writeBack: true })
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
    slug: Base.Slug
    json: Base.JSONContent
    user: UserCompact<unknown>
    privilege: Base.Meta['privilege']
    dynamic: boolean
  }) {
    return this.saveLocal(opt)
  }
}
export namespace ArticleProvider {
  export type JSONContent = Base.JSONContent
}
