import { nativeEnum, number, object, string } from 'zod'
import { zodLeaderboardRankingSystem } from '../shapes'
import { router as _router, publicProcedure as p } from '../trpc'
import { userProcedure } from './../middleware/user'
import { Mode, Ruleset } from '~/def'
import { ClanProvider, clanProvider } from '~/server/singleton/service'

export const router = _router({
  search: p.input(object({
    keyword: string().default(''),
    page: number().min(0).max(5).default(0),
    perPage: number().min(1).max(10).default(10),
    mode: nativeEnum(Mode).default(Mode.Osu),
    ruleset: nativeEnum(Ruleset).default(Ruleset.Standard),
    rankingSystem: zodLeaderboardRankingSystem,
  })).query(({ input }) => {
    return clanProvider.search(input)
  }),
  detail: p.input(object({
    id: string(),
  })).query(async ({ input }) => {
    return mapId(await clanProvider.detail({
      id: ClanProvider.stringToId(input.id),
    }), ClanProvider.idToString)
  }),
  relation: userProcedure.input(object({
    id: string(),
  })).query(({ input, ctx }) => {
    return clanProvider.getClanRelation({ userId: ctx.user.id, clanId: ClanProvider.stringToId(input.id) })
  }),
  join: userProcedure.input(object({
    id: string(),
  })).mutation(({ input, ctx }) => {
    return clanProvider.joinRequest({ userId: ctx.user.id, clanId: ClanProvider.stringToId(input.id) })
  }),
  leave: userProcedure.input(object({
    id: string(),
  })).mutation(({ input, ctx }) => {
    return clanProvider.leaveRequest({ userId: ctx.user.id, clanId: ClanProvider.stringToId(input.id) })
  }),
})
