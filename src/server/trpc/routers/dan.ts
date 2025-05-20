import { type ZodSchema, any, array, boolean, literal, nativeEnum, number, object, string, tuple, union } from 'zod'
import { TRPCError } from '@trpc/server'
import { type DanProvider as BaseDanProvider } from '../../backend/$base/server'
import { bNProcedure, roleProcedure } from '../middleware/role'
import { router as _router, publicProcedure } from '../trpc'
import { zodMode, zodRuleset } from '../shapes'
import { validateUsecase } from '~/common/utils/dan'
import { type Cond, type Dan, type DatabaseDan, type DatabaseDanCourse, type DatabaseRequirementCondBinding, Requirement } from '~/def/dan'
import { Feature } from '~/def/features'
import { DanProvider, ScoreProvider, UserProvider, dans } from '~/server/singleton/service'
import { type PaginatedResult } from '~/def/pagination'
import { GucchoError } from '~/def/messages'

const publicDan = withFeature(Feature.Dan, publicProcedure)
const bnDan = withFeature(Feature.Dan, bNProcedure)

const bnOrStaffDan = withFeature(Feature.Dan, roleProcedure.use(({ ctx, next }) => {
  if (ctx.user.role.admin || ctx.user.role.staff) {
    return next()
  }
  throw new TRPCError({ code: 'UNAUTHORIZED', message: fromGucchoErrorCode(GucchoError.RequireAdminPrivilege) })
}))

const qualifiedScorePickType = union([literal('id'), literal('pp'), literal('score'), literal('accuracy')])
export const router = _router({
  search: publicProcedure
    .input(
      object({
        keyword: string(),
        rulesetDefaultsToStandard: boolean().optional().default(false),
        mode: zodMode.optional(),
        ruleset: zodRuleset.optional(),
        page: number().int().min(0).default(0),
        perPage: number().int().min(1).max(10).default(10),
        mania: object({
          keyCount: number().int().min(2).max(10).optional(),
        }).default(() => ({})),
      })
    )
    .query(async ({ input }) => {
      const searchResult = await dans.search(input)
      return {
        total: searchResult.total,
        data: searchResult.data?.map(i => ({
          ...i,
          id: DanProvider.idToString(i.id),
          creator: i.creator ? UserProvider.idToString(i.creator) : undefined,
          updater: i.updater ? UserProvider.idToString(i.updater) : undefined,
          requirements: i.requirements.map(i => ({
            ...i,
          })) satisfies DatabaseRequirementCondBinding<string, Requirement, Cond>[],
        })) satisfies DatabaseDan<string>[],
      } as PaginatedResult<DatabaseDan<string>>
    }),

  get: publicDan
    .input(string())
    .query(async ({ input }) => {
      const res = await dans.get(DanProvider.stringToId(input))
      return transformDan(res)
    }),

  delete: bnDan
    .input(string())
    .mutation(async ({ input }) => await dans.delete(DanProvider.stringToId(input))),

  save: bnDan
    .input(
      any()
        .refine((i): i is DatabaseDan<string> => !!validateUsecase(i as DatabaseDan<string>)) as ZodSchema<Omit<DatabaseDan<string>, 'createdAt' | 'updatedAt'>>
    )
    .mutation(async ({ input, ctx }) => {
      const i = await dans.saveComposed({
        ...input,
        id: input.id ? DanProvider.stringToId(input.id) : undefined,
        requirements: input.requirements,
      }, ctx.user)
      return {
        ...i,
        id: DanProvider.idToString(i.id),
        creator: i.creator ? UserProvider.idToString(i.creator) : undefined,
        updater: i.updater ? UserProvider.idToString(i.updater) : undefined,
        requirements: i.requirements,
      }
    }),

  // scores: publicProcedure
  //   .input(object({
  //     id: string(),
  //     page: number().min(0).max(5).default(0),
  //     perPage: number().min(1).max(10).default(10),
  //   }))
  //   .query(async ({ input }) => {
  //     return dans.scores(input)
  //   }),

  userRule: publicDan
    .input(any().refine((i): i is Dan => validateUsecase(i))).query(async ({ input }) => {
      const result = await dans.runCustomDan(input)
      return result.map(i => ({
        ...i,
        scores: i.scores.map(s => ({
          ...s,
          score: {
            ...s.score,
            id: ScoreProvider.scoreIdToString(s.score.id),
          },
        })),
      }))
    }),

  getQualifiedScores: publicDan
    .input(object({
      id: string(),
      requirement: nativeEnum(Requirement),
      page: number().min(0).default(0),
      perPage: number().min(1).max(10).default(10),
      pick: qualifiedScorePickType.optional(),
      orderBy: tuple([qualifiedScorePickType, union([literal('asc'), literal('desc')])]).optional(),
    })).query(async ({ input }) => {
      const result = await dans.getQualifiedScores({
        id: DanProvider.stringToId(input.id),
        requirement: input.requirement,
        page: input.page,
        perPage: input.perPage,
        pick: input.pick,
        orderBy: input.orderBy,
      })

      return ({
        count: result.count,
        scores: result.scores.map(s => ({
          ...s,
          score: mapId(s.score, ScoreProvider.scoreIdToString),
          player: mapId(s.player, DanProvider.idToString),
          beatmap: mapId(s.beatmap, DanProvider.idToString),
        })) as BaseDanProvider.QualifiedScore<string, string>[],
      })
    }),

  userClearedScores: _router({
    count: publicDan
      .input(object({
        id: string(),
        mode: zodMode.optional(),
        ruleset: zodRuleset.optional(),
        mania: object({
          keyCount: number().int().min(2).max(10).optional(),
        }).default(() => ({})),
      })).query(async ({ input }) => {
        const data = await dans.countUserClearedDans({
          ...input,
          user: { id: DanProvider.stringToId(input.id) },
        })

        return data
      }),

    list: publicDan
      .input(object({
        id: string(),
        page: number().min(0).max(5).default(0),
        perPage: number().min(1).max(10).default(10),
        mode: zodMode.optional(),
        ruleset: zodRuleset.optional(),
        mania: object({
          keyCount: number().int().min(2).max(8).optional(),
        }).default(() => ({})),
      })).query(async ({ input }) => {
        const data = await dans.getUserClearedDans({
          ...input,
          user: { id: DanProvider.stringToId(input.id) },
        })

        return data.map((item) => {
          return {
            ...item,
            dan: mapId(item.dan, DanProvider.idToString),
            score: {
              ...item.score,
              id: ScoreProvider.scoreIdToString(item.score.id),
              beatmap: {
                ...item.score.beatmap,
                id: DanProvider.idToString(item.score.beatmap.id),
                beatmapset: mapId(item.score.beatmap.beatmapset, DanProvider.idToString),
              },
            },
          }
        }) satisfies BaseDanProvider.UserDanClearedScore<string, string>[]
      }),

    recalc: bnOrStaffDan
      .input(
        object({
          dan: object({
            id: string(),
            requirement: nativeEnum(Requirement).optional(),
          }),
          user: object({
            id: string(),
          }).optional(),
        })
      )
      .mutation(async ({ input }) => {
        await dans.recalcQualifiedScores({
          dan: mapId(input.dan, DanProvider.stringToId),
          user: input.user
            ? {
                id: DanProvider.stringToId(input.user.id),
              }
            : undefined,
        })
      }),
  }),

  exportAll: bnDan
    .query(async () => {
      return (await dans.exportAll()).map(transformDan)
    }),

  course: _router({
    search: publicProcedure
      .input(
        object({
          keyword: string(),
          rulesetDefaultsToStandard: boolean().optional().default(false),
          mode: zodMode.optional(),
          ruleset: zodRuleset.optional(),
          page: number().int().min(0).default(0),
          perPage: number().int().min(1).max(10).default(10),
          allowEmpty: boolean().default(false),
          mania: object({
            keyCount: number().int().min(2).max(10).optional(),
          }).default(() => ({})),
        })
      )
      .query(async ({ input }) => {
        const searchResult = await dans.searchCourses(input)
        return {
          total: searchResult.total,
          data: searchResult.data?.map(i => ({
            ...i,
            id: DanProvider.idToString(i.id),
            creator: i.creator ? UserProvider.idToString(i.creator) : undefined,
            updater: i.updater ? UserProvider.idToString(i.updater) : undefined,
            dans: i.dans.map(i => ({
              ...i,
              id: DanProvider.idToString(i.id),
              creator: i.creator ? UserProvider.idToString(i.creator) : undefined,
              updater: i.updater ? UserProvider.idToString(i.updater) : undefined,
              requirements: i.requirements.map(i => ({
                ...i,
              })) satisfies DatabaseRequirementCondBinding<string, Requirement, Cond>[],
            })) satisfies DatabaseDan<string>[],
          })) satisfies DatabaseDanCourse<string>[],
        } as PaginatedResult<DatabaseDanCourse<string>>
      }),

    get: publicDan
      .input(string())
      .query(async ({ input }) => {
        const res = await dans.getCourse(DanProvider.stringToId(input))
        return {
          ...res,
          id: DanProvider.idToString(res.id),
          creator: res.creator ? UserProvider.idToString(res.creator) : undefined,
          updater: res.updater ? UserProvider.idToString(res.updater) : undefined,
          dans: res.dans.map(i => ({
            ...i,
            id: DanProvider.idToString(i.id),
            creator: i.creator ? UserProvider.idToString(i.creator) : undefined,
            updater: i.updater ? UserProvider.idToString(i.updater) : undefined,
            requirements: i.requirements.map(i => ({
              ...i,
            })) satisfies DatabaseRequirementCondBinding<string, Requirement, Cond>[],
          })) satisfies DatabaseDan<string>[],
        }
      }),

    create: bnDan
      .input(object({
        name: string().min(4),
        description: string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const course = await dans.createCourse({
          name: input.name,
          description: input.description,
        }, ctx.user)
        return DanProvider.idToString(course)
      }),

    update: bnDan
      .input(object({
        id: string(),
        name: string(),
        description: string(),
        dans: array(object({
          id: string(),
          shortName: string(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const course = await dans.updateCourse({
          id: DanProvider.stringToId(input.id),
          name: input.name,
          description: input.description,
          dans: input.dans.map(d => ({ id: DanProvider.stringToId(d.id), shortName: d.shortName })),
        }, ctx.user)
        return {
          ...course,
          id: DanProvider.idToString(course.id),
          creator: course.creator ? UserProvider.idToString(course.creator) : undefined,
          updater: course.updater ? UserProvider.idToString(course.updater) : undefined,
          dans: course.dans.map(d => ({
            ...d,
            id: DanProvider.idToString(d.id),
            creator: d.creator ? UserProvider.idToString(d.creator) : undefined,
            updater: d.updater ? UserProvider.idToString(d.updater) : undefined,
            requirements: d.requirements.map(r => ({ ...r })),
          })),
        }
      }),

    delete: bnDan
      .input(object({
        id: string(),
        deleteDans: boolean().default(false),
      }))
      .mutation(async ({ input }) => await dans.deleteCourse({
        id: DanProvider.stringToId(input.id),
        deleteDans: input.deleteDans,
      })),

    searchDan: bnDan
      .input(
        object({
          keyword: string(),
          rulesetDefaultsToStandard: boolean().optional().default(false),
          mode: zodMode.optional(),
          ruleset: zodRuleset.optional(),
          page: number().int().min(0).default(0),
          perPage: number().int().min(1).max(100).default(20),
          mania: object({
            keyCount: number().int().min(2).max(10).optional(),
          }).default(() => ({})),
          excludeDanCourse: string().optional(),
          excludeDans: array(string()).optional(),
          danglingOnly: boolean().optional(),
        })
      )
      .query(async ({ input }) => {
        const searchResult = await dans.search({
          ...input,
          excludeDanCourse: input.excludeDanCourse ? DanProvider.stringToId(input.excludeDanCourse) : undefined,
          excludeDans: input.excludeDans ? input.excludeDans.map(DanProvider.stringToId) : undefined,
          danglingOnly: input.danglingOnly,
        })
        return {
          total: searchResult.total,
          data: searchResult.data?.map(i => ({
            ...i,
            id: DanProvider.idToString(i.id),
            creator: i.creator ? UserProvider.idToString(i.creator) : undefined,
            updater: i.updater ? UserProvider.idToString(i.updater) : undefined,
            requirements: i.requirements.map(i => ({
              ...i,
            })) satisfies DatabaseRequirementCondBinding<string, Requirement, Cond>[],
          })) satisfies DatabaseDan<string>[],
        } as PaginatedResult<DatabaseDan<string>>
      }),
  }),

})

function transformDan(res: DatabaseDan<any>): DatabaseDan<string> {
  return mapId(res, DanProvider.idToString)
}
