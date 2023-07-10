import fs from 'node:fs/promises'
import { isAbsolute, join, relative, resolve } from 'node:path'
import { PathLike } from 'node:fs'
import * as BSON from 'bson'
import type { JSONContent as TipTapJSONContent } from '@tiptap/core'
import { generateHTML } from '@tiptap/html'

import { DeepPartial } from '@trpc/server'
import { compileGraph, createPipeline, hops } from 'schema-evolution'
import dirTree from 'directory-tree'

import { latest, paths, v0, versions } from './v'
import { UserEssential, UserPrivilege } from '~/def/user'
import useEditorExtensions from '~/composables/useEditorExtensionsServer'
import { UserRelationProvider } from '$active/server'
import { Logger } from '$base/log'

const logger = Logger.child({ label: 'article' })

async function access(file: PathLike, constant?: typeof fs['constants'][keyof typeof fs['constants']]) {
  return fs.access(file, constant).then(() => true).catch(() => false)
}

export abstract class ArticleProvider {
  relation = new UserRelationProvider()
  relative = 'articles'
  articles = resolve(this.relative)
  fallbacks = new Map<string, ArticleProvider.Content & ArticleProvider.Meta & ArticleProvider.Version>()
  static ReadAccess = latest.ReadAccess
  static WriteAccess = latest.WriteAccess
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
    const r = relative(this.articles, path)
    return r && !r.startsWith('..') && !isAbsolute(r)
  }

  abstract get(opt: {
    slug: string
    fallback: boolean
    user: UserEssential<any>
  }): PromiseLike<(ArticleProvider.Content & ArticleProvider.Meta & ArticleProvider.Version & ArticleProvider.AccessControl) | undefined>

  abstract save(opt: {
    slug: string
    json: ArticleProvider.JSONContent
    privilege: ArticleProvider.Meta['privilege']
    user: UserEssential<any>
  }): PromiseLike<void>

  async getLocal(opt: {
    slug: string
    fallback?: boolean
    user?: UserEssential<any>
  }): Promise<(ArticleProvider.Meta & ArticleProvider.Content & ArticleProvider.Version) | undefined> {
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

  serialize(content: ArticleProvider.Content & ArticleProvider.Meta & ArticleProvider.Version) {
    return BSON.serialize(content)
  }

  deserialize(data: Uint8Array) {
    return BSON.deserialize(data)
  }

  validate(content: { v?: keyof typeof versions }, opt: ArticleProvider.ValidateOpt): (ArticleProvider.Meta & ArticleProvider.Content & ArticleProvider.Version) | undefined {
    // let flagDiff = false

    if (content.v === undefined) {
      content.v = v0.v
      // flagDiff = true
    }
    if (!(content.v in versions)) {
      throw new Error('unknown version')
    }
    if (content.v === latest.v) {
      return latest.parse(content)
    }

    const head = versions[content.v].parse(content)
    const pipeline = createPipeline(compileGraph(paths), content.v, latest.v)
    const route = hops(pipeline.path)
    if (route?.length) {
      // flagDiff = true
      const fileOrId = 'id' in opt ? `unknown = ${opt.id}` : `File = ${relative(this.articles, opt.file.toString())}`
      logger.info({
        message: `Updated Article<${fileOrId}> to latest version: ${route.map(String).join(' -> ')}.`,
        fix: 'To get rid of logs like this please open then save this article in the article editor.',
      })
    }
    return latest.parse(pipeline.migrate(head))
  }

  async saveLocal(opt: {
    slug: string
    json: ArticleProvider.JSONContent
    privilege: ArticleProvider.Meta['privilege']
    user: UserEssential<any>
    dynamic: boolean
  }): Promise<void> {
    if (!opt.user.roles.find(role => ['admin', 'owner'].includes(role))) {
      throw new Error('you have insufficient privilege to edit this article')
    }
    const pContent = this.createContent(opt)
    let meta: ArticleProvider.Meta

    const loc = join(this.articles, opt.slug)
    const exists = await access(loc)

    const oldContent = exists && await this.getLocal({ slug: opt.slug, fallback: false, user: opt.user })
    if (oldContent) {
      const oldMeta: ArticleProvider.Meta = pick(oldContent, ['created', 'lastUpdated', 'owner', 'privilege'])
      meta = this.createMeta({
        ...oldMeta,
        privilege: oldMeta.privilege ?? opt.privilege,
      })
    }
    else {
      meta = this.createMeta({
        owner: opt.user.id,
        privilege: opt.privilege,
        created: [opt.user.id, new Date()],
        lastUpdated: [opt.user.id, new Date()],
      })
    }
    await fs.writeFile(loc, this.serialize({
      ...await pContent,
      ...meta,
      v: latest.v,
    }))
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

  async render(doc: ArticleProvider.JSONContent) {
    const renderExtensions = useEditorExtensions()
    return generateHTML(doc, renderExtensions)
  }

  async createContent(opt: Omit<ArticleProvider.Content, 'html'>) {
    const base = {
      ...opt,
    }
    if (opt.dynamic) {
      return base as ArticleProvider.DynamicContent
    }
    else {
      return Object.assign(base, {
        html: await this.render(opt.json),
        dynamic: false,
      }) as ArticleProvider.StaticContent
    }
  }

  createMeta(opt: DeepPartial<ArticleProvider.Meta>): ArticleProvider.Meta {
    return latest.metaSchema.parse({
      privilege: opt.privilege,
      owner: opt.owner ?? ArticleProvider.builtInAuthor,
      created: opt.created ?? [opt.owner, new Date()],
      lastUpdated: opt.created ?? [opt.owner, new Date()],
    })
  }

  async checkPrivilege(
    access: keyof ArticleProvider.Meta['privilege'],
    content: ArticleProvider.Meta,
    user?: { id: unknown; roles: UserPrivilege[] }
  ) {
    const privRequired = content.privilege[access]

    return (
      (access === 'read' && content.privilege?.read.includes(ArticleProvider.ReadAccess.Public))
      || (user && ((user.id === content.owner) || (privRequired).some(priv => user.roles.includes(priv as any))))
    ) || false
  }

  async getLocalSlugs(query?: string) {
    return dirTree(relative('.', this.articles), { normalizePath: true }, (item, PATH, stats) => {
      item.path = relative(this.relative, item.path)
    })
  }
}

export namespace ArticleProvider {
  export const builtInAuthor = 'built-in'

  export type JSONContent = TipTapJSONContent & { __brand: 'JSONContent' }
  export type TReadAccess = latest.TReadAccess
  export type TWriteAccess = latest.TWriteAccess
  export const readAccess = latest.readAccess
  export const writeAccess = latest.writeAccess

  export interface BaseContent {
    json: ArticleProvider.JSONContent
  }
  export interface Version {
    v: string | number
  }
  export interface DynamicContent extends BaseContent {
    dynamic: true
  }

  export interface StaticContent extends BaseContent {
    dynamic: false
    html: string
  }

  export type Content = DynamicContent | StaticContent
  export type OwnerId = string | number
  export type Signature = [unknown, Date]
  export interface Meta<Id extends OwnerId = OwnerId> {
    privilege: {
      read: TReadAccess[]
      write: TWriteAccess[]
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
    id: unknown
  })
}
