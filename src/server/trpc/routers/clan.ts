import { nativeEnum, number, object, string } from 'zod'
import { zodLeaderboardRankingSystem } from '../shapes'
import { router as _router, publicProcedure as p } from '../trpc'
import { userProcedure } from './../middleware/user'
import type { AbnormalStatus, BeatmapSource, Beatmapset, NormalBeatmapWithMeta, RankingStatus } from '~/def/beatmap'
import { type LeaderboardRankingSystem } from '~/def/common'
import { Mode, Ruleset } from '~/def'
import type { PaginatedResult } from '~/def/pagination'
import type { UserCompact } from '~/def/user'
import { ClanProvider, MapProvider, ScoreProvider, UserProvider, clanProvider } from '~/server/singleton/service'
import type { RankingSystemScore } from '~/def/score'

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

  joinedUsers: p.input(object({
    id: string(),
    page: number().default(0),
    perPage: number().default(20),
  })).query(async ({ input }) => {
    const res = await clanProvider.users({
      id: ClanProvider.stringToId(input.id),
      page: input.page,
      perPage: input.perPage,
    })
    return [
      res[0],
      res[1].map(item => mapId(item, ClanProvider.idToString)),
    ] as const satisfies PaginatedResult<UserCompact<string>>
  }),

  bests: p.input(object({
    id: string(),
    mode: nativeEnum(Mode).default(Mode.Osu),
    ruleset: nativeEnum(Ruleset).default(Ruleset.Standard),
    rankingSystem: zodLeaderboardRankingSystem,
    page: number().default(0),
    perPage: number().default(20),
  })).query(async ({ input }) => {
    const res = await clanProvider.bests({
      id: ClanProvider.stringToId(input.id),
      page: input.page,
      perPage: input.perPage,
      mode: input.mode,
      ruleset: input.ruleset,
      rankingSystem: input.rankingSystem,
    })
    return [
      res[0],
      res[1].map((item) => {
        const bm = item.score.beatmap satisfies NormalBeatmapWithMeta<BeatmapSource, Exclude<RankingStatus, AbnormalStatus>, any, any> as NormalBeatmapWithMeta<BeatmapSource, Exclude<RankingStatus, AbnormalStatus>, any, any>
        return {
          user: mapId(item.user, UserProvider.idToString),
          score: {
            ...mapId(item.score, ScoreProvider.scoreIdToString),
            beatmap: {
              ...bm,
              beatmapset: mapId(bm.beatmapset, MapProvider.idToString, ['id', 'foreignId']) satisfies Beatmapset<BeatmapSource, string, string>,
              status: bm.status,
            } satisfies NormalBeatmapWithMeta<BeatmapSource, Exclude<RankingStatus, AbnormalStatus>, string, string> as NormalBeatmapWithMeta<BeatmapSource, Exclude<RankingStatus, AbnormalStatus>, string, string>,
          },
        }
      }),
    ] satisfies PaginatedResult<{ user: UserCompact<string>; score: RankingSystemScore<string, string, Mode, LeaderboardRankingSystem> }>
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
