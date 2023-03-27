import fs from 'fs/promises'
import { isAbsolute, join, relative, resolve } from 'path'
import { BSON } from 'bson'
import type { JSONContent } from '@tiptap/core'
import { generateHTML } from '@tiptap/html'
import type { UserEssential, UserPrivilegeString } from '~/types/user'
import useEditorExtensions from '~/composables/useEditorExtensions'

type AccessPrivilege = UserPrivilegeString | 'self'
interface Content<ownerId = unknown> {
  json: JSONContent
  html: string

  privilege?: {
    read?: AccessPrivilege[]
    delete?: AccessPrivilege[]
    write?: AccessPrivilege[]
  }
  owner?: ownerId
}

const defaultContentPrivilege: NonNullable<Content['privilege']> = {
  delete: ['staff', 'self'],
  write: ['staff', 'self'],
}

export abstract class ArticleProvider {
  articles = resolve('articles')
  fallbacks = new Map<string, Content<unknown>>()
  constructor() {
    this.initFallbacks()
  }

  initFallbacks() {
    (['404', '403'] as const).forEach(async (code) => {
      const fb = await this.getLocalArticleData({ slug: `fallbacks/${code}` })
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

  abstract get(opt: {
    slug: string
    fallback: boolean
  }): Promise<Content<unknown> | undefined>
  abstract save(opt: {
    slug: string
    content: JSONContent
    access: Content['privilege']
    user: UserEssential<unknown>
  }): Promise<void>

  async getLocal(opt: {
    slug: string
    fallback?: boolean
    user: UserEssential<unknown>
  }): Promise<Content<unknown> | undefined> {
    const content = await this.getLocalArticleData(opt)
    if (!content) {
      return undefined
    }
    if (
      !this.checkPrivilege(
        'read',
        Object.assign(content, {
          privilege: { ...defaultContentPrivilege, ...content.privilege },
        }),
        opt.user,
      )
    ) {
      throw new Error('insufficient privilege')
    }
    return content
  }

  protected async getLocalArticleData(opt: {
    slug: string
    fallback?: boolean
  }) {
    const { slug, fallback } = opt
    let file = join(this.articles, slug)
    if (!this.inside(file)) {
      return this.fallbacks.get('403')
    }
    try {
      let check = fs.access(file, fs.constants.R_OK)
      if (fallback) {
        check = check
          .catch((_) => {
            file = join(this.articles, './fallbacks', slug)
          })
          .then(() => fs.access(file, fs.constants.R_OK))
      }
      await check
      const content = this.deserialize(await fs.readFile(file))
      return Object.assign(content, {
        privilege: { ...defaultContentPrivilege, ...content.privilege },
      })
    }
    catch (e) {
      return undefined
    }
  }

  protected serialize(content: Content<unknown>) {
    return BSON.serialize(content)
  }

  protected deserialize(data: Uint8Array) {
    const content = BSON.deserialize(data)
    const succeed = 'html' in content && 'json' in content
    if (!succeed) {
      throw new Error('unable to deserialize content')
    }
    return content as Content<unknown>
  }

  async saveLocal({
    slug,
    content,
    user,
  }: {
    slug: string
    content: JSONContent
    access: Content['privilege']
    user: UserEssential<unknown>
  }): Promise<void> {
    if (!user.roles.find(role => ['admin', 'owner'].includes(role))) {
      throw new Error('you have insufficient privilege to edit this article')
    }
    const loc = join(this.articles, slug)
    const _content = this.createContent({ json: content, owner: user.id })
    await fs.writeFile(loc, this.serialize(_content))
  }

  render(content: JSONContent) {
    const renderExtensions = useEditorExtensions()
    return generateHTML(content, renderExtensions)
  }

  createContent(opt: {
    json: JSONContent
    privilege?: Content['privilege']
    owner: unknown
  }) {
    const { json, privilege, owner } = opt
    return <Content<unknown>>{
      json,
      html: this.render(json),
      privilege: {
        ...defaultContentPrivilege,
        ...privilege,
      },
      owner,
    }
  }

  checkPrivilege(
    access: 'read' | 'write' | 'delete',
    content: Content,
    user: { id: unknown; roles: UserPrivilegeString[] },
  ) {
    const privRequired = content.privilege?.[access]
    if (!privRequired) {
      return true
    }
    if (privRequired.includes('self') && user.id === content.owner) {
      return true
    }
    return (privRequired as UserPrivilegeString[]).some(priv =>
      user.roles.includes(priv),
    )
  }
}
