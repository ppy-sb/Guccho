import { array, boolean, nativeEnum, number, object, string, tuple } from 'zod'
import { zodHandle, zodMetricsPeriod, zodMode, zodRuleset } from '../../shapes'
import { type AdminMapProvider as BaseAdminMapProvider } from '../../../backend/$base/server'
import { router as log } from './log'
import { Logger } from '$base/logger'
import { AdminMapProvider, UserProvider, adminMap, adminScore, adminUser } from '~/server/singleton/service'
import { adminProcedure, bNProcedure } from '~/server/trpc/middleware/role'
import { router as _router } from '~/server/trpc/trpc'
import { UserRole } from '~/def/user'
import { CountryCode } from '~/def/country-code'
import { isUserFieldEditable } from '~/common/utils/admin'
import { BeatmapSource, RankingStatus } from '~/def/beatmap'

const logger = Logger.child({ label: 'admin' })

const searchUserParam = object({
  id: string().trim(),
  name: string().trim(),
  safeName: string().trim(),
  email: string().email(),
  flag: nativeEnum(CountryCode),
  registeredFrom: string().datetime(),
  registeredTo: string().datetime(),
  latestActivityFrom: string().datetime(),
  latestActivityTo: string().datetime(),
  roles: array(nativeEnum(UserRole)),
})
  .partial()
  .and(
    object({
      perPage: number().default(10),
      page: number().default(0),
    })
  )

export const router = _router({
  log,
  userManagement: _router({
    search: adminProcedure
      .input(searchUserParam)
      .query(({ input }) => {
        return adminUser.userList({
          ...input,
          flag: input.flag === CountryCode.Unknown ? undefined : input.flag,
          id: input.id ? UserProvider.stringToId(input.id) : undefined,
        })
      }),
    detail: adminProcedure.input(string()).query(({ input }) => {
      return adminUser.userDetail({ id: UserProvider.stringToId(input) }).then(detail => mapId(detail, UserProvider.idToString))
    }),
    saveDetail: adminProcedure
      .input(
        tuple([
          string(),
          object({
            id: string(),
            name: zodHandle,
            safeName: zodHandle,
            email: string().email(),
            flag: nativeEnum(CountryCode),
            roles: array(nativeEnum(UserRole)),

            password: string().optional(),
          }).partial(),
        ])
      )
      .mutation(async ({ input, ctx }) => {
        let [id, newVal] = input
        // staff can only change some fields
        if (!ctx.user.role.admin) {
          const keys = Object.keys(newVal).filter(i => isUserFieldEditable(i as keyof typeof newVal, ctx.user.role)) as Array<keyof typeof newVal>
          newVal = pick(newVal, keys)
        }
        const res = await adminUser.updateUserDetail(
          ctx.user,
          {
            id: UserProvider.stringToId(id),
          },
          {
            ...newVal,
            id: newVal.id ? UserProvider.stringToId(newVal.id) : undefined,
          },
        )

        logger.info(`user ${ctx.user.safeName}<${ctx.user.id}> updated user detail.`, { user: pick(ctx.user, ['id', 'name']), newVal })

        return mapId(res, UserProvider.idToString)
      }),

    recalcUserStat: adminProcedure
      .input(object({
        id: string(),
        mode: zodMode,
        ruleset: zodRuleset,
      }))
      .mutation(async ({ input }) => {
        return adminUser.recalcUserModeRulesetStatistics({ id: UserProvider.stringToId(input.id), mode: input.mode, ruleset: input.ruleset })
      }),

    clearUserStat: adminProcedure
      .input(object({
        id: string(),
        mode: zodMode,
        ruleset: zodRuleset,
      }))
      .mutation(async ({ input }) => {
        return adminUser.clearUserModeRulesetStatistics({ id: UserProvider.stringToId(input.id), mode: input.mode, ruleset: input.ruleset })
      }),

    getUserStats: adminProcedure
      .input(object({
        id: string(),
        mode: zodMode,
        ruleset: zodRuleset,
      }))
      .query(async ({ input }) => {
        return adminUser.getUserModeRulesetStatistics({ id: UserProvider.stringToId(input.id), mode: input.mode, ruleset: input.ruleset })
      }),

    clearUserAllStats: adminProcedure
      .input(object({
        id: string(),
      }))
      .mutation(async ({ input }) => {
        return adminUser.clearUserAllStatistics({ id: UserProvider.stringToId(input.id) })
      }),

    recalcUserAllStats: adminProcedure
      .input(object({
        id: string(),
      }))
      .mutation(async ({ input }) => {
        return adminUser.recalcUserAllStatistics({ id: UserProvider.stringToId(input.id) })
      }),

    metrics: adminProcedure
      .input(
        object({
          active: zodMetricsPeriod,
        })
      )
      .query(async ({ input }) => {
        const metrics = await adminUser.metrics(input)
        return metrics
      }),

  }),
  map: _router({
    search: bNProcedure
      .input(
        object({
          keyword: string(),
          mode: zodMode.optional(),
          requested: boolean().default(false),
          page: number().min(0).default(0),
          perPage: number().min(1).default(10),
        })
      )
      .query(async ({ input }) => {
        const result = await adminMap.search(input)
        const rData = result.data.map((item) => {
          return {
            ...item,
            id: AdminMapProvider.idToString(item.id),
            foreignId: 'foreignId' in item ? AdminMapProvider.idToString(item.foreignId) : undefined,
            maps: item.maps.map(m => ({
              ...m,
              id: AdminMapProvider.idToString(m.id),
              foreignId: 'foreignId' in m ? AdminMapProvider.idToString(m.foreignId) : undefined,
            })),
          } as BaseAdminMapProvider.SearchResultData<string, string>
        })
        return {
          data: rData,
          total: result.total,
        }
      }),
    metrics: bNProcedure
      .input(
        object({
          active: zodMetricsPeriod,
        })
      )
      .query(async ({ input }) => {
        return adminMap.metrics(input)
      }),
    updateBeatmap: bNProcedure
      .input(
        object({
          id: string(),
        }).and(
          object({
            version: string(),
            md5: string(),
            status: nativeEnum(RankingStatus).optional(),
            source: nativeEnum(BeatmapSource).optional(),
            foreignId: string().optional(),
          })
            .partial()
        )
      )
      .mutation(async ({ input }) => {
        const res = await adminMap.update({
          id: AdminMapProvider.stringToId(input.id),
          version: input.version,
          md5: input.md5,
          status: input.status,
          // source: input.source,
          // foreignId: input.foreignId ? AdminMapProvider.stringToId(input.foreignId) : undefined,
        })
        return {
          ...res,
          id: AdminMapProvider.idToString(res.id),
          foreignId: 'foreignId' in res ? AdminMapProvider.idToString(res.foreignId) : undefined,
        }
      }),
  }),
  score: _router({
    metrics: bNProcedure
      .input(
        object({
          active: zodMetricsPeriod,
        })
      )
      .query(async ({ input }) => {
        return adminScore.metrics(input)
      }),
  }),
})
