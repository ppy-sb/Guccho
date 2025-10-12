import type { PathLike } from 'node:fs'
import fs from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import type { JSONContent as TipTapJSONContent } from '@tiptap/core'
import { generateHTML } from '@tiptap/html'
import type { DeepPartial } from '@trpc/server'
import * as BSON from 'bson'
import dirTree from 'directory-tree'
import { compileGraph, createPipeline, hops } from 'schema-evolution'
import { config as getConfig } from '../../env'
import { latest, paths, v0, versions } from './v'
import useEditorExtensions from '~/composables/useEditorExtensionsServer'
import { Lang } from '~/def'
import { GucchoError } from '~/def/messages'
import type { UserCompact, UserRole } from '~/def/user'
import { Logger } from '$base/logger'

const logger = Logger.child({ label: 'article' })

async function access(file: PathLike, constant?: typeof fs['constants'][keyof typeof fs['constants']]) {
  return fs.access(file, constant).then(() => true).catch(() => false)
}
async function ensureFolder(path: PathLike) {
  await fs.mkdir(path, { recursive: true })
}

const config = getConfig()

export abstract class ArticleProvider {
  static articles = resolve(config.article.location)
  static ReadAccess = latest.ReadAccess
  static WriteAccess = latest.WriteAccess

  abstract get(opt: {
    slug: ArticleProvider.Slug
    fallback: boolean
    user?: UserCompact<any>
    lang: Lang
  }): Promise<ArticleProvider.Full | undefined>

  abstract editorGet(opt: {
    slug: ArticleProvider.Slug
    user?: UserCompact<any>
  }): Promise<ArticleProvider.Full | undefined>

  async getFallbackContent(opt: { slug: ArticleProvider.Slug; lang: Lang }) {
    const { slug, lang } = opt
    return (
      false
      || await this.getLocal({ slug: `fallbacks/${slug}` as ArticleProvider.Slug, fallback: false, lang })
      || await this.getLocal({ slug: '404' as ArticleProvider.Slug, fallback: true, lang })
      || throwGucchoError(GucchoError.ArticleNotFound)
    )
  }

  abstract save(opt: {
    slug: ArticleProvider.Slug
    json: ArticleProvider.JSONContent
    privilege: ArticleProvider.Meta['privilege']
    user: UserCompact<any>
  }): Promise<void>

  async delete(opt: { slug: ArticleProvider.Slug; user: UserCompact<any> }) {
    return ArticleProvider.deleteLocal(opt)
  }

  static inside(path: ArticleProvider.Path) {
    const r = relative(ArticleProvider.articles, path)
    return r && !r.startsWith('..') && !isAbsolute(r)
  }

  createTrySlugs(slug: ArticleProvider.Slug, locale: Lang) {
    return [
      `${ArticleProvider.packPath(slug)}/${locale}` as ArticleProvider.Slug,
      `${ArticleProvider.packPath(slug)}/${Lang.enGB}` as ArticleProvider.Slug,
      slug,
    ] as ArticleProvider.Slug[]
  }

  static mapLangSlugs(slug: ArticleProvider.Slug) {
    return [
      ...Object.values(Lang).map(lang => `${ArticleProvider.packPath(slug)}/${lang}` as ArticleProvider.Slug),
      slug,
    ] as ArticleProvider.Slug[]
  }

  async getLocal(opt: {
    slug: ArticleProvider.Slug
    fallback?: boolean
    user?: UserCompact<any>
    lang: Lang
  }): Promise<ArticleProvider.Core | undefined> {
    try {
      for (const subPath of this.createTrySlugs(opt.slug, opt.lang)) {
        console.warn('try', subPath)
        const content = await this.getLocalArticle({ subPath, lang: opt.lang })
        if (content) {
          return content
        }
      }
      if (opt.fallback) {
        return await this.getFallbackContent({ slug: opt.slug, lang: opt.lang })
      }
    }
    catch (e) {
      console.error(e)
    }
  }

  static serialize(content: ArticleProvider.Core) {
    return BSON.serialize(content)
  }

  static deserialize(data: Uint8Array) {
    return BSON.deserialize(data)
  }

  static validate(content: { v?: keyof typeof versions }, opt: ArticleProvider.ValidateOpt): ArticleProvider.Core | undefined {
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
      const fileOrId = 'id' in opt ? `unknown = ${opt.id}` : `File = ${relative(ArticleProvider.articles, opt.file.toString())}`
      logger.info({
        message: `Updated Article<${fileOrId}> to latest version: ${route.map(String).join(' -> ')}.`,
        fix: 'To get rid of logs like this please open then save this article in the article editor.',
      })
    }
    return latest.parse(pipeline.migrate(head))
  }

  async saveLocal(opt: {
    slug: ArticleProvider.Slug
    json: ArticleProvider.JSONContent
    privilege: ArticleProvider.Meta['privilege']
    user: UserCompact<any>
    dynamic: boolean
  }): Promise<void> {
    if (!opt.user.roles.find(role => ['admin', 'owner'].includes(role))) {
      throwGucchoError(GucchoError.InsufficientPrivilegeToEditArticle)
    }
    const pContent = ArticleProvider.createContent(opt)
    let meta: ArticleProvider.Meta

    const exactPath = this.toPath(opt.slug)
    const exists = await access(exactPath)

    // update exact file
    const oldContent = exists && await ArticleProvider.getLocalArticleData(exactPath)
    if (oldContent) {
      const oldMeta: ArticleProvider.Meta = pick(oldContent, ['created', 'lastUpdated', 'owner', 'privilege'])
      meta = ArticleProvider.createMeta({
        ...oldMeta,
        privilege: oldMeta.privilege ?? opt.privilege,
      })
    }
    else {
      meta = ArticleProvider.createMeta({
        owner: opt.user.id,
        privilege: opt.privilege,
        created: [opt.user.id, new Date()],
        lastUpdated: [opt.user.id, new Date()],
      })
    }
    await ensureFolder(dirname(exactPath))
    await fs.writeFile(exactPath, ArticleProvider.serialize({
      ...await pContent,
      ...meta,
      v: latest.v,
    }))

    // try update related files
    const relatedFiles = await this.getRelatedFiles(opt.slug)
    for (const file of relatedFiles) {
      const oldContent = await ArticleProvider.getLocalArticleData(file)
      if (oldContent) {
        const oldMeta: ArticleProvider.Meta = pick(oldContent, ['created', 'lastUpdated', 'owner', 'privilege'])
        const meta = ArticleProvider.createMeta({
          ...oldMeta,
          privilege: oldMeta.privilege ?? opt.privilege,
        })
        await fs.writeFile(file, ArticleProvider.serialize({
          ...await pContent,
          ...meta,
          v: latest.v,
        }))
      }
    }
  }

  async getRelatedFiles(slug: ArticleProvider.Slug) {
    const maybeFiles = await Promise.all(
      this
        .suggestRelatedFilePaths(slug)
        .map(path => [path, access(path)] as const)
    )

    return maybeFiles
      .filter(([_, exists]) => exists)
      .map(([path]) => path)
  }

  suggestRelatedFilePaths(slug: ArticleProvider.Slug) {
    const parts = slug.split('/')
    // ${slug}/${locale}
    if (parts.at(-1) && Lang[parts.at(-1) as keyof typeof Lang]) {
      parts.pop()
    }
    return ArticleProvider
      .mapLangSlugs(parts.join('/') as ArticleProvider.Slug)
      .filter(_slug => _slug !== slug)
      .map(s => ArticleProvider.toPath(s))
      .filter(ArticleProvider.inside)
  }

  static async deleteLocal(opt: { slug: ArticleProvider.Slug; user: UserCompact<any> }) {
    const { user, slug } = opt
    if (!user.roles.find(role => ['admin', 'owner'].includes(role))) {
      throwGucchoError(GucchoError.InsufficientPrivilegeToEditArticle)
    }
    const loc = ArticleProvider.toPath(slug)
    if (!ArticleProvider.inside(loc)) {
      throwGucchoError(GucchoError.FileSystemArticlePathOutsideArticleRoot)
    }
    if (!relative(join(ArticleProvider.articles, './fallbacks'), loc).startsWith('..')) {
      throwGucchoError(GucchoError.TryingToDeleteFallbackContents)
    }
    const fData = await fs.lstat(loc)
    if (fData.isDirectory()) {
      return await fs.rmdir(loc, { recursive: true })
    }
    return await fs.rm(loc)
  }

  static async render(doc: ArticleProvider.JSONContent) {
    const renderExtensions = useEditorExtensions({ i18n: { t: i => i } })
    return generateHTML(doc, renderExtensions)
  }

  static async createContent(opt: Omit<ArticleProvider.Content, 'html'>) {
    const base = {
      ...opt,
    }
    if (opt.dynamic) {
      return base as ArticleProvider.DynamicContent
    }
    else {
      return Object.assign(base, {
        html: await ArticleProvider.render(opt.json),
        dynamic: false,
      }) as ArticleProvider.StaticContent
    }
  }

  static createMeta(opt: DeepPartial<ArticleProvider.Meta>): ArticleProvider.Meta {
    return latest.metaSchema.parse({
      privilege: opt.privilege,
      owner: opt.owner ?? ArticleProvider.builtInAuthor,
      created: opt.created ?? [opt.owner, new Date()],
      lastUpdated: opt.created ?? [opt.owner, new Date()],
    })
  }

  static async checkPrivilege(
    access: keyof ArticleProvider.Meta['privilege'],
    content: ArticleProvider.Meta,
    user?: { id: unknown; roles: UserRole[] },
  ) {
    const privRequired = content.privilege[access]

    return (
      (access === 'read' && content.privilege?.read.includes(ArticleProvider.ReadAccess.Public))
      || (user && ((user.id === content.owner) || (privRequired).some(priv => user.roles.includes(priv as any))))
    ) || false
  }

  static async getLocalSlugs(query?: string) {
    // path: string
    // name: string
    // children?: Prop[]
    // expandLevel?: number
    // level?: number
    return pick(dirTree(relative('.', ArticleProvider.articles), { normalizePath: true }, (item /* PATH, stats */) => {
      item.path = relative(config.article.location, item.path)
    }), ['path', 'name', 'children'])
  }

  protected async getLocalArticle(opt: {
    subPath: ArticleProvider.Slug
    lang: Lang
  }): Promise<ArticleProvider.Core | undefined> {
    const file = this.toPath(opt.subPath)
    if (!ArticleProvider.inside(file)) {
      return this.getFallbackContent({ slug: '403' as ArticleProvider.Slug, lang: opt.lang })
    }
    const data = await ArticleProvider.getLocalArticleData(file)
    if (!data) {
      return undefined
    }
    return ArticleProvider.validate(data, { file, tryUpdate: true, writeBack: true })
  }

  protected static async getLocalArticleData(path: ArticleProvider.Path) {
    const canAccessOriginalFile = await access(path, fs.constants.R_OK)
    if (!canAccessOriginalFile) {
      return undefined
    }

    const content = ArticleProvider.deserialize(Uint8Array.from(await fs.readFile(path)))
    return content
  }

  toPath(slug: ArticleProvider.Slug): ArticleProvider.Path {
    return ArticleProvider.toPath(slug)
  }

  static toPath(slug: ArticleProvider.Slug): ArticleProvider.Path {
    return join(ArticleProvider.articles, slug) as ArticleProvider.Path
  }

  static packPath(slug: ArticleProvider.Slug) {
    return `${slug}.gal` as ArticleProvider.Path
    // gal = Guccho Article Localized
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

  export type Path = string & {
    __brand: 'Path'
  }

  export type Slug = string & {
    __brand: 'Slug'
  }
  export type Core = (Content & Meta & Version)
  export type Full = (Core & AccessControl)
}
