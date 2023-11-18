import { nativeEnum, number, object, string } from 'zod'
import { zodLeaderboardRankingSystem } from '../shapes'
import { router as _router, publicProcedure as p } from '../trpc'
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
    id: string().trim(),
  })).query(({ input }) => {
    return clanProvider.detail({
      id: ClanProvider.stringToId(input.id),
    })
  }),
})
