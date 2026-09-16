import { array, boolean, number, object, string } from 'zod'
import { optionalUserProcedure } from '../middleware/optional-user'
import { userProcedure } from '../middleware/user'
import { zodSearchBeatmap } from '../shapes'
import { router as _router, publicProcedure as p } from '../trpc'
import { MapProvider, UserProvider, maps } from '~/server/singleton/service'
import { RankingStatus } from '~/def/beatmap'
import { UserRole } from '~/def/user'
import type { Tag } from '~/def/search'

function canUseAdvancedSearch(user?: { roles: UserRole[] }) {
  return Boolean(user?.roles.some(role =>
    role === UserRole.Supporter
    || role === UserRole.Admin
    || role === UserRole.Owner
    || role === UserRole.BeatmapNominator
  ))
}

function searchFiltersForUser(filters: Tag[] | undefined, user?: { roles: UserRole[] }) {
  if (canUseAdvancedSearch(user)) {
    return filters
  }

  const mania = filters?.some(([key, op, value]) =>key === 'mode' && value === 'mania')
  return filters?.filter(([key, op, value]) =>
   key === 'mode'
   ||key === 'frozen'
   || (mania &&key === 'circleSize')
  )
}

export const router = _router({
  beatmapset: optionalUserProcedure
    .input(
      object({
        id: string().trim(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const bs = await maps.getBeatmapset({ id: MapProvider.stringToId(input.id) }, ctx.user ? { id: UserProvider.stringToId(ctx.user.id) } : undefined)
      const returnValue = {
        ...isLocalMapOrMapset(bs)
          ? mapId(bs, MapProvider.idToString)
          : mapId(bs, MapProvider.idToString, ['id', 'foreignId']),

        beatmaps: bs.beatmaps.map(
          bm => isLocalMapOrMapset(bm)
            ? mapId(bm, MapProvider.idToString)
            : mapId(bm, MapProvider.idToString, ['id', 'foreignId'])
        ),
      }
      return returnValue
    }),

  beatmap: p.input(string().trim()).query(async ({ input }) => {
    const bm = await maps.getBeatmap(input)
    switch (bm.status) {
      case RankingStatus.Deleted:
      case RankingStatus.NotFound: {
        return bm
      }
      default: {
        return isLocalMapOrMapset(bm)
          ? mapId(bm, MapProvider.idToString)
          : mapId(bm, MapProvider.idToString, ['id', 'foreignId'])
      }
    }
  }),

  voteBeatmap: userProcedure
    .input(
      object({
        id: string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error('User not authenticated')
      }
      return maps.voteMap(MapProvider.stringToId(input.id), {
        id: UserProvider.stringToId(ctx.user.id),
      })
    }),

  searchBeatmap: optionalUserProcedure
    .input(
      object({
        keyword: string(),
        page: number().int().min(0).optional().default(0),
        perPage: number().int().min(1).max(100).optional().default(20),
        filters: array(zodSearchBeatmap).optional(),
      }),
    )
    .query(async ({ input: { keyword, page, perPage, filters }, ctx }) => {
      const beatmaps = await maps.searchBeatmap({
        keyword,
        page,
        perPage,
        filters: searchFiltersForUser(filters, ctx.user),
      })

      return beatmaps.map(b => mapId(b, MapProvider.idToString))
    }),
  searchBeatmapset: optionalUserProcedure
    .input(
      object({
        keyword: string(),
        limit: number().int().min(1).max(100).optional().default(20),
        offset: number().int().min(0).optional().default(0),
        filters: array(zodSearchBeatmap).optional(),
      }),
    )
    .query(async ({ input: { keyword, limit, offset, filters }, ctx }) => {
      const beatmapsets = await maps.searchBeatmapset({
        keyword,
        limit,
        offset,
        filters: searchFiltersForUser(filters, ctx.user),
      })

      return beatmapsets.map(bs => mapId(bs, MapProvider.idToString))
    }),
  searchBeatmapsetGrouped: optionalUserProcedure
    .input(
      object({
        keyword: string(),
        limit: number().int().min(1).max(100).optional().default(20),
        offset: number().int().min(0).optional().default(0),
        filters: array(zodSearchBeatmap).optional(),
        mapsetOnly: boolean().optional().default(false),
      }),
    )
    .query(async ({ input: { keyword, limit, offset, filters, mapsetOnly }, ctx }) => {
      const results = await maps.searchBeatmapsetGrouped({
        keyword,
        limit,
        offset,
        filters: searchFiltersForUser(filters, ctx.user),
        mapsetOnly,
      })
      return results.map(result => ({
        ...mapId(result, MapProvider.idToString),
        beatmaps: mapsetOnly ? [] : result.beatmaps.map(beatmap => mapId(beatmap, MapProvider.idToString)),
      }))
    }),
  canUseAdvancedSearch: optionalUserProcedure.query(({ ctx }) => canUseAdvancedSearch(ctx.user)),
})
