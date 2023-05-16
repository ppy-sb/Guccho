import fs from 'node:fs/promises'

import { isAbsolute, join, relative, resolve } from 'node:path'
import { PathLike } from 'node:fs'
import { BSON } from 'bson'
import type { JSONContent as TipTapJSONContent } from '@tiptap/core'
import { generateHTML } from '@tiptap/html'
import { z } from 'zod'

import { Id } from '../..'
import { latest, v0, versions } from './version-control/v'
import { findShortestPath } from './version-control/path'
import { paths } from './version-control'
import type { UserEssential, UserPrivilegeString } from '~/types/user'
import useEditorExtensions from '~/composables/useEditorExtensions'
import { UserRelationProvider } from '~/server/backend/bancho.py/server'

async function access(file: PathLike, constant?: typeof fs['constants'][keyof typeof fs['constants']]) {
  return fs.access(file, constant).then(() => true).catch(() => false)
}

export abstract class ArticleProvider {
  relation = new UserRelationProvider()
  articles = resolve('articles')
  fallbacks = new Map<string, ArticleProvider.Content & ArticleProvider.Meta>()
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
  }): PromiseLike<(ArticleProvider.Content & ArticleProvider.Meta & ArticleProvider.AccessControl) | undefined>

  abstract save(opt: {
    slug: string
    content: ArticleProvider.JSONContent
    privilege: ArticleProvider.Meta['privilege']
    user: UserEssential<any>
  }): PromiseLike<void>

  async getLocal(opt: {
    slug: string
    fallback?: boolean
    user?: UserEssential<any>
  }): Promise<(ArticleProvider.Meta<any> & ArticleProvider.Content) | undefined> {
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

    const canAccessOriginalFile = await access(file, fs.constants.R_OK)
    if (!canAccessOriginalFile) {
      if (!fallback) {
        return undefined
      }
      file = join(this.articles, './fallbacks', slug)
      if (!await access(file, fs.constants.R_OK)) {
        return undefined
      }
    }

    const content = this.deserialize(await fs.readFile(file))
    return this.validate(content, { file, tryUpdate: true, writeBack: true })
  }

  serialize(content: ArticleProvider.Content & ArticleProvider.Meta) {
    return BSON.serialize(content)
  }

  deserialize(data: Uint8Array) {
    return BSON.deserialize(data)
  }

  validate(content: { v?: string | number | symbol }, opt: ArticleProvider.ValidateOpt) {
    if (content.v === undefined) {
      content.v = v0.v
    }
    if (!(content.v in versions)) {
      throw new Error('unknown version')
    }
    const parsed = versions[(content.v as keyof typeof versions)].schema.safeParse(content)
    if (!parsed.success) {
      throw new Error('article may be broken')
    }
    const latestVersion = latest.v
    const path = findShortestPath(paths, content.v, latestVersion)
    if (!path) {
      throw new Error('unable to update article to latest format')
    }

    const result = path.rawPath.reduce((acc, cur) => cur.update(acc), parsed.data)
    return latest.schema.parse(result)
  }

  async saveLocal({
    slug,
    content,
    user,
    privilege,
    dynamic,
  }: {
    slug: string
    content: ArticleProvider.JSONContent
    privilege: ArticleProvider.Meta['privilege']
    user: UserEssential<any>
    dynamic: boolean
  }): Promise<void> {
    if (!user.roles.find(role => ['admin', 'owner'].includes(role))) {
      throw new Error('you have insufficient privilege to edit this article')
    }
    const loc = join(this.articles, slug)
    const exists = await fs.access(loc).then(() => true).catch(() => false)
    if (!exists) {
      const _content = this.createContent({
        json: content,
        privilege,
        owner: user.id,
        dynamic,
      })
      await fs.writeFile(loc, this.serialize(_content))
    }
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

  render(content: ArticleProvider.JSONContent) {
    const renderExtensions = useEditorExtensions()
    return generateHTML(content, renderExtensions)
  }

  createContent(opt: Pick<ArticleProvider.Content & ArticleProvider.Meta, 'json' | 'privilege' | 'owner' | 'dynamic'>): ArticleProvider.Content & ArticleProvider.Meta {
    const { json, privilege, owner, dynamic } = opt
    const base = {
      json,
      privilege,
      owner,
      v: latest.v,
      created: [owner, new Date()] as ArticleProvider.Signature,
      lastUpdated: [owner, new Date()] as ArticleProvider.Signature,
    }
    if (dynamic) {
      return Object.assign(base, {
        dynamic,
      })
    }
    else {
      return Object.assign(base, {
        html: this.render(json),
        dynamic: true,
      })
    }
  }

  // updateContent<T extends ArticleProvider.Content & ArticleProvider.Meta>(content: T, update: Partial<Pick<T, 'json' | 'privilege' | 'owner' | 'dynamic' | 'lastUpdate'>>) {
  //   throw new Error('not impl\'d yet')
  // }

  async checkPrivilege(
    access: 'read' | 'write',
    content: ArticleProvider.Meta,
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

export namespace ArticleProvider {

  export const writeAccess = latest.writeAccess
  export const readAccess = latest.readAccess
  export const builtInAuthor = 'built-in'

  export type WriteAccess = z.infer<typeof writeAccess>
  export type ReadAccess = z.infer<typeof readAccess>
  export type JSONContent = TipTapJSONContent & { __brand: 'JSONContent' }

  export interface BaseContent {
    json: ArticleProvider.JSONContent
    v: number
  }
  export interface DynamicContent extends BaseContent {
    dynamic: true
  }

  export interface GeneratedContent extends BaseContent {
    dynamic: false
    html: string
  }

  export type Content = DynamicContent | GeneratedContent
  export type OwnerId = string | number
  export type Signature = [Id, Date]
  export interface Meta<Id extends OwnerId = OwnerId> {
    privilege: {
      read: ReadAccess[]
      write: WriteAccess[]
    }
    owner: Id
    created: Signature
    lastUpdated: Signature
  }
  export type BuiltInMeta = ArticleProvider.Meta<typeof builtInAuthor>

  export interface AccessControl {
    access: {
      read: boolean
      write: boolean
    }
  }

  export type ValidateOpt = {
    tryUpdate: boolean
    writeBack: boolean
  } & ({
    file: PathLike
  } | {
    id: Id
  })
}
