import fs from 'node:fs/promises'
import { isAbsolute, join, relative, resolve } from 'node:path'
import { BSON } from 'bson'
import type { JSONContent } from '@tiptap/core'
import { generateHTML } from '@tiptap/html'
import type { UserEssential, UserPrivilegeString } from '~/types/user'
import useEditorExtensions from '~/composables/useEditorExtensions'
import { UserRelationProvider } from '~/server/adapters/bancho.py/server'

export type WriteAccess = 'staff' | 'moderator' | 'beatmapNominator'
export type ReadAccess = WriteAccess | 'public'
export interface Content {
  json: JSONContent
  html: string
}
export interface ContentPrivilege<ownerId = any> extends Content {
  privilege: {
    read: ReadAccess[]
    write: WriteAccess[]
  }
  owner?: ownerId
}

export interface AccessControl {
  access: {
    read: boolean
    write: boolean
  }
}

const defaultContentPrivilege: ContentPrivilege['privilege'] = {
  read: ['public'],
  write: ['staff'],
}

export abstract class ArticleProvider {
  relation = new UserRelationProvider()
  articles = resolve('articles')
  fallbacks = new Map<string, Content & ContentPrivilege>()
  constructor() {
    this.initFallbacks()
  }

  initFallbacks() {
    (['404', '403'] as const).forEach(async (code) => {
      const fb = await this.getLocalArticleData({ slug: code, fallback: true })
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
    user: UserEssential<any>
  }): PromiseLike<(ContentPrivilege & Content & AccessControl) | undefined>

  abstract save(opt: {
    slug: string
    content: JSONContent
    privilege: ContentPrivilege['privilege']
    user: UserEssential<any>
  }): PromiseLike<void>

  async getLocal(opt: {
    slug: string
    fallback?: boolean
    user?: UserEssential<any>
  }): Promise<(ContentPrivilege<any> & Content) | undefined> {
    const content = await this.getLocalArticleData(opt)
    if (!content) {
      return undefined
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

  protected serialize(content: Content & ContentPrivilege) {
    return BSON.serialize(content)
  }

  protected deserialize(data: Uint8Array) {
    const content = BSON.deserialize(data)
    const succeed = 'html' in content && 'json' in content
    if (!succeed) {
      throw new Error('unable to deserialize content')
    }
    return content as ContentPrivilege & Content
  }

  async saveLocal({
    slug,
    content,
    user,
    privilege,
  }: {
    slug: string
    content: JSONContent
    privilege: ContentPrivilege['privilege']
    user: UserEssential<any>
  }): Promise<void> {
    if (!user.roles.find(role => ['admin', 'owner'].includes(role))) {
      throw new Error('you have insufficient privilege to edit this article')
    }
    const loc = join(this.articles, slug)
    const _content = this.createContent({
      json: content,
      privilege,
      owner: user.id,
    })
    await fs.writeFile(loc, this.serialize(_content))
  }

  async delete(opt: { slug: string; user: UserEssential<any> }) {
    return this.deleteLocal(opt)
  }

  async deleteLocal(opt: { slug: string; user: UserEssential<any> }) {
    const { user, slug } = opt
    if (!user.roles.find(role => ['admin', 'owner'].includes(role))) {
      throw new Error('you have insufficient privilege to edit this article')
    }
    const loc = join(this.articles, slug)
    if (!this.inside(loc)) {
      throw new Error('dangerous operation')
    }
    if (!relative(join(this.articles, './fallbacks'), loc).startsWith('..')) {
      throw new Error('trying to delete fallback contents')
    }
    return await fs.rm(loc)
  }

  render(content: JSONContent) {
    const renderExtensions = useEditorExtensions()
    return generateHTML(content, renderExtensions)
  }

  createContent(opt: {
    json: JSONContent
    privilege?: ContentPrivilege['privilege']
    owner: any
  }) {
    const { json, privilege, owner } = opt
    return <ContentPrivilege>{
      json,
      html: this.render(json),
      privilege: {
        ...defaultContentPrivilege,
        ...privilege,
      },
      owner,
    }
  }

  async checkPrivilege(
    access: 'read' | 'write',
    content: ContentPrivilege,
    user?: { id: unknown; roles: UserPrivilegeString[] }
  ) {
    const privRequired = content.privilege?.[access]

    // legacy optional read
    if (!privRequired && access === 'read') {
      return true
    }
    if (!privRequired) {
      return false
    }
    return (
      (access === 'read' && content.privilege?.read.includes('public'))
      || (user
        && (
          (user.id === content.owner)
          || (privRequired).some(priv => user.roles.includes(priv as any))
        )
      )
      || false
    )
  }
}
