import { type Schema, any, array, boolean, object, record, string, union } from 'zod'
import { optionalUserProcedure } from '../middleware/optional-user'
import { staffProcedure } from '../middleware/role'
import { userProcedure } from '../middleware/user'
import { router as _router } from '../trpc'
import { ArticleProvider, articles } from '~/server/singleton/service'
import { GucchoError } from '~/def/messages'
import { type ArticleProvider as BaseArticleProvider } from '$base/server/article'
import { Logger } from '$base/logger'
import localeDetector from '~/server/localeDetector'
import { Lang } from '~/def'

const logger = Logger.child({ label: 'article' })

const zodSlug: Schema<BaseArticleProvider.Slug> = string().trim() as any

export const router = _router({
  get: optionalUserProcedure
    .input(union([string().trim(), array(string().trim())]))
    .query(async ({ input, ctx }) => {
      const lang = localeDetector(ctx.h3Event, {
        defaultLocale: Lang.enGB,
        fallbackLocale: Lang.enGB,
      }) as Lang
      if (Array.isArray(input)) {
        input = input.join('/')
      }
      try {
        const r = await articles.get({ slug: input as BaseArticleProvider.Slug, fallback: true, user: ctx.user, lang })
        if (!r) {
          const notFound = await articles.getFallbackContent({ slug: '404' as BaseArticleProvider.Slug, lang })
          if (!notFound) {
            throwGucchoError(GucchoError.ArticleNotFound)
          }
          const html = notFound.dynamic ? await ArticleProvider.render(notFound.json) : notFound.html

          return {
            html,
            access: {
              read: true,
              write: false,
            },
          }
        }
        return r.dynamic
          ? {
              json: r.json,
              access: r.access,
            }
          : {
              html: r.html,
              access: r.access,
            }
      }
      catch (e) {
        console.error(e)
        throw e
      }
    }),

  localSlugs: staffProcedure
    .input(string().trim().optional())
    .query(({ input }) => ArticleProvider.getLocalSlugs(input)),

  editor: _router({
    get: userProcedure
      .input(zodSlug)
      .query(({ input, ctx }) => articles.editorGet({ slug: input, user: ctx.user })),

    save: staffProcedure
      .input(object({
        slug: zodSlug,
        json: record(any(), any()).refine((arg): arg is BaseArticleProvider.JSONContent => {
          return !!arg
        }),
        privilege: object({
          read: array(ArticleProvider.readAccess),
          write: array(ArticleProvider.writeAccess),
        }),
        dynamic: boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        const r = await articles.save(Object.assign(input, { user: ctx.user }))
        logger.info(`user ${ctx.user.safeName}<${ctx.user.id}> saved article ${input.slug}`, {
          slug: input.slug,
          user: pick(ctx.user, ['id', 'name', 'roles']),
        })
        return r
      }),

    delete: staffProcedure
      .input(object({
        slug: zodSlug,
      }))
      .mutation(async ({ input, ctx }) => {
        const r = await articles.delete(Object.assign(input, { user: ctx.user }))
        logger.info(`user ${ctx.user.safeName}<${ctx.user.id}> deleted article ${input.slug}`, {
          slug: input.slug,
          user: ctx.user,
        })
        return r
      }),
  }),
})
