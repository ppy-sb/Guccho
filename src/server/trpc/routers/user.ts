import { TRPCError } from '@trpc/server'
import { array, number, object, string } from 'zod'
import { hasLeaderboardRankingSystem, hasRuleset } from '../config'
import { optionalUserProcedure } from '../middleware/optional-user'
import { sessionProcedure } from '../middleware/session'
import {
  zodHandle,
  zodLeaderboardRankingSystem,
  zodMode,
  zodRankingStatus,
  zodRelationType,
  zodRuleset,
} from '../shapes'
import { router as _router, publicProcedure as p } from '../trpc'
import { Logger } from '$base/logger'
import { type MailTokenProvider as MBase, type MailTokenProvider, type UserProvider as TU } from '$base/server'
import { type Mode } from '~/def'
import { type RankingStatus } from '~/def/beatmap'
import { type LeaderboardRankingSystem } from '$active'
import { Mail } from '~/def/mail'
import { GucchoError } from '~/def/messages'
import { type RankingSystemScore } from '~/def/score'
import { Scope, type UserCompact, UserRole } from '~/def/user'
import { Constant } from '~/server/common/constants'
import { MapProvider, ScoreProvider, UserProvider, mail, mailToken, sessions, userRelations, users } from '~/server/singleton/service'
import ui from '~~/guccho.ui.config'

const logger = Logger.child({ label: 'user' })

export const map = localeKey.root

function userIsVisible(user: Pick<UserCompact<any>, 'id' | 'roles'>, viewer?: Pick<UserCompact<any>, 'id' | 'roles'>) {
  return user.id === viewer?.id
  || viewer?.roles.includes(UserRole.Staff)
  || (!user.roles.includes(UserRole.Restricted))
}

const userNotFoundError = createGucchoError(GucchoError.UserNotFound)

export const router = _router({
  uniqueIdent: p
    .input(zodHandle)
    .query(({ input: handle }) => {
      return users.uniqueIdent(handle)
    }),
  userpage: optionalUserProcedure
    .input(
      object({
        handle: zodHandle,
      }),
    )
    .query(async ({ input: { handle }, ctx }) => {
      const user = await users.getFull({
        handle,
        excludes: { relationships: true, secrets: true, email: true },
        includeHidden: true,
        scope: Scope.Self,
      })

      if (!userIsVisible(user, ctx.user)) {
        throw userNotFoundError
      }
      return mapId(user, UserProvider.idToString)
    }),
  statistic: optionalUserProcedure
    .input(
      object({
        id: string(),
        mode: zodMode,
        ruleset: zodRuleset,
        rankingSystem: zodLeaderboardRankingSystem,
      }),
    )
    .query(async ({ input, ctx }) => {
      const { mode, ruleset } = input
      try {
        return await users.getStatistic(
          { id: UserProvider.stringToId(input.id), mode, ruleset },
          ctx.user ? { id: UserProvider.stringToId(ctx.user.id) } : undefined
        )
      }
      catch (e) {
        console.error(e)
        throw e
      }
    }),
  best: optionalUserProcedure
    .input(
      object({
        id: string(),
        mode: zodMode,
        ruleset: zodRuleset,
        rankingSystem: zodLeaderboardRankingSystem,
        page: number().gte(0).lt(10),
        includes: array(zodRankingStatus).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { mode, ruleset, rankingSystem } = input
      if (
        !hasRuleset(mode, ruleset)
        || !hasLeaderboardRankingSystem(mode, ruleset, rankingSystem)
      ) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'ranking system not supported',
        })
      }
      const user = await users.getCompactById(UserProvider.stringToId(input.id))

      if (!userIsVisible(user, ctx.user)) {
        throw userNotFoundError
      }

      const returnValue = await users.getBests({
        id: user.id,
        mode,
        ruleset,
        rankingSystem,
        page: input.page,
        perPage: 10,
        rankingStatus: input.includes,
      })
      if (!returnValue) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }
      // return mapId(returnValue, ScoreProvider.scoreIdToString)
      return returnValue.map(v => ({
        ...mapId(v, ScoreProvider.scoreIdToString),
        beatmap: beatmapIsVisible(v.beatmap)
          ? {
              ...isLocalMapOrMapset(v.beatmap)
                ? mapId(v.beatmap, MapProvider.idToString)
                : mapId(v.beatmap, MapProvider.idToString, ['id', 'foreignId']),
              beatmapset: isLocalMapOrMapset(v.beatmap.beatmapset)
                ? mapId(v.beatmap.beatmapset, MapProvider.idToString)
                : mapId(v.beatmap.beatmapset, MapProvider.idToString, ['id', 'foreignId']),
            }
          : v.beatmap,
      })) as RankingSystemScore<string, string, Mode, LeaderboardRankingSystem, RankingStatus>[]
    }),
  tops: optionalUserProcedure
    .input(
      object({
        id: string(),
        mode: zodMode,
        ruleset: zodRuleset,
        rankingSystem: zodLeaderboardRankingSystem,
        page: number().gte(0).lt(10),
        includes: array(zodRankingStatus).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { mode, ruleset, rankingSystem } = input
      if (
        !hasRuleset(mode, ruleset)
        || !hasLeaderboardRankingSystem(mode, ruleset, rankingSystem)
      ) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'ranking system not supported',
        })
      }

      const user = await users.getCompactById(UserProvider.stringToId(input.id))

      if (!userIsVisible(user, ctx.user)) {
        throw userNotFoundError
      }

      const returnValue = await users.getTops({
        id: user.id,
        mode: input.mode,
        ruleset: input.ruleset,
        rankingSystem: input.rankingSystem,
        page: input.page,
        perPage: 10,
        rankingStatus: input.includes,
      })
      if (!returnValue) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }
      return {
        count: returnValue.count,
        scores: returnValue.scores.map(v => ({
          ...mapId(v, ScoreProvider.scoreIdToString),
          beatmap: beatmapIsVisible(v.beatmap)
            ? {
                ...isLocalMapOrMapset(v.beatmap)
                  ? mapId(v.beatmap, MapProvider.idToString)
                  : mapId(v.beatmap, MapProvider.idToString, ['id', 'foreignId']),
                beatmapset: isLocalMapOrMapset(v.beatmap.beatmapset)
                  ? mapId(v.beatmap.beatmapset, MapProvider.idToString)
                  : mapId(v.beatmap.beatmapset, MapProvider.idToString, ['id', 'foreignId']),
              }
            : v.beatmap,
        })) as RankingSystemScore<string, string, Mode, LeaderboardRankingSystem, RankingStatus>[],
      }
    }),
  recent: optionalUserProcedure
    .input(
      object({
        id: string(),
        mode: zodMode,
        ruleset: zodRuleset,
        rankingSystem: zodLeaderboardRankingSystem,
        page: number().gte(0).lt(10),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { mode, ruleset, rankingSystem } = input
      if (
        !hasRuleset(mode, ruleset)
      || !hasLeaderboardRankingSystem(mode, ruleset, rankingSystem)
      ) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'ranking system not supported',
        })
      }

      const user = await users.getCompactById(UserProvider.stringToId(input.id))

      if (!userIsVisible(user, ctx.user)) {
        throw userNotFoundError
      }

      const returnValue = await users.getRecentScores({
        id: user.id,
        mode: input.mode,
        ruleset: input.ruleset,
        rankingSystem: input.rankingSystem,
        page: input.page,
        perPage: 10,
      })
      if (!returnValue) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }

      return returnValue.map((v) => {
        if (v.type === 'single') {
        // RulesetScore
          return {
            ...mapId(v, ScoreProvider.scoreIdToString),
            beatmap: beatmapIsVisible(v.beatmap)
              ? {
                  ...isLocalMapOrMapset(v.beatmap)
                    ? mapId(v.beatmap, MapProvider.idToString)
                    : mapId(v.beatmap, MapProvider.idToString, ['id', 'foreignId']),
                  beatmapset: isLocalMapOrMapset(v.beatmap.beatmapset)
                    ? mapId(v.beatmap.beatmapset, MapProvider.idToString)
                    : mapId(v.beatmap.beatmapset, MapProvider.idToString, ['id', 'foreignId']),
                }
              : v.beatmap,
          }
        }
        else {
          // ModeRulesetRecentScoreGroup
          return {
            type: v.type,
            pinned: ScoreProvider.scoreIdToString(v.pinned),
            scores: v.scores.map(s => mapId(s, ScoreProvider.scoreIdToString)),
            beatmap: beatmapIsVisible(v.beatmap)
              ? {
                  ...isLocalMapOrMapset(v.beatmap)
                    ? mapId(v.beatmap, MapProvider.idToString)
                    : mapId(v.beatmap, MapProvider.idToString, ['id', 'foreignId']),
                  beatmapset: isLocalMapOrMapset(v.beatmap.beatmapset)
                    ? mapId(v.beatmap.beatmapset, MapProvider.idToString)
                    : mapId(v.beatmap.beatmapset, MapProvider.idToString, ['id', 'foreignId']),
                }
              : v.beatmap,
          }
        }
      }) as TU.RecentScoresResult<string, string>[]
    }),
  essential: p
    .input(
      object({
        handle: zodHandle,
      }),
    )
    .query(async ({ input }) => {
      const user = await users.getCompact({ handle: input.handle, scope: Scope.Public })

      return mapId(user, UserProvider.idToString)
    }),
  countRelations: optionalUserProcedure
    .input(
      object({
        id: string(),
        type: zodRelationType,
      }),
    )
    .query(async ({ input: { id, type }, ctx }) => {
      const user = await users.getCompactById(UserProvider.stringToId(id))

      if (!userIsVisible(user, ctx.user)) {
        raiseError(userNotFoundError)
      }

      const count = await userRelations.count({ user, type })
      return count
    }),
  status: p
    .input(object({
      id: string().trim(),
    })).query(async ({ input: { id } }) => {
      return await users.status({ id: UserProvider.stringToId(id) })
    }),

  search: p
    .input(
      object({
        keyword: string(),
        limit: number().optional().default(10),
      }),
    )
    .query(async ({ input: { keyword, limit } }) => {
      const results = await users.search({
        keyword,
        limit,
      })

      return results.map(u => mapId(u, UserProvider.idToString))
    }),

  register: _router({
    sendEmailCode: sessionProcedure
      .input(string().email())
      .mutation(async ({ ctx, input }) => {
        await ctx.session.getBinding() ?? throwGucchoError(GucchoError.SessionNotFound)

        // check if email is taken
        if (
          await users
            .getByEmail(input as MBase.Email, { scope: Scope.Self })
            .catch(_ => undefined)
        ) {
          throwGucchoError(GucchoError.ConflictEmail)
        }
        const variant = Mail.Variant.Registration

        const { otp, token } = await mailToken.getOrCreate(input as MBase.Email)
        const t = await useTranslation(ctx.h3Event)
        const serverName = t(localeKey.root.server.name.__path__)
        const mailVariant = localeKey.root.mail[variant]

        type Param = Mail.Param[typeof variant]

        await mail.send({
          to: input,

          subject: t(
            mailVariant.subject.__path__,
            { serverName } satisfies Param['subject']
          ),

          content: t(
            mailVariant.content.__path__,
            {
              serverName,
              otp,
              link: host(`/mail/verify?t=${token}&a=${variant}`, ctx.h3Event, { fallbackURL: `osu.${ui.baseUrl}` }),
              ttl: Constant.EmailTokenTTLInMinutes as number,
            } satisfies Param['content']
          ),
        })
        logger.info(`new user validating email,otp sent to ${input}.`, { email: input })
      }),

    createAccount: sessionProcedure
      .input(object({
        name: string().trim(),
        safeName: string().trim().optional(),
        emailToken: string().uuid(),
        // email: string().trim().email(),
        password: string().trim(),
      }))
      .mutation(async ({ input, ctx }) => {
        const rec = await mailToken.get({ token: input.emailToken as MBase.Token }) ?? throwGucchoError(GucchoError.EmailTokenNotFound)
        const { name, safeName, password } = input

        const user = await users.register({
          name,
          safeName,
          password,
          email: rec.email,
        })

        logger.info(`user ${user.safeName}<${user.id}> registered.`, { user: pick(user, ['id', 'name']) })

        await ctx.session.update({ userId: UserProvider.idToString(user.id) })

        // background jobs
        mailToken.deleteAll(rec.email).catch(e => logger.error({ message: `failed to delete mail token: ${e.message}` }))

        return user
      }),

  }),

  accountRecovery: _router({
    otp: p
      .input(string().email())
      .mutation(async ({ ctx, input }) => {
        const variant = Mail.Variant.AccountRecovery
        const ip = getRequestIP(ctx.h3Event, { xForwardedFor: true }) ?? '0.0.0.0'
        const UA = getHeader(ctx.h3Event, 'User-Agent')

        const user = await users
          .getByEmail(input as MailTokenProvider.Email, { scope: Scope.Self })
          .catch((e) => {
            // An unknown address must be indistinguishable from a registered one,
            // otherwise this endpoint can be used to test whether an email exists.
            if (e instanceof TRPCError && e.message === fromGucchoErrorCode(GucchoError.UserNotFound)) {
              return undefined
            }
            throw e
          })

        if (!user) {
          // Keep probes visible in the operator log without answering them.
          logger.info(`password reset requested for an unregistered email ${input} from ${ip}, UA: ${UA}.`, { email: input, ip, UA })
          return
        }

        const { otp, token } = await mailToken.getOrCreate(input as MailTokenProvider.Email)
        const t = await useTranslation(ctx.h3Event)
        const serverName = t(localeKey.root.server.name.__path__)
        const mailVariant = localeKey.root.mail[variant]

        type Param = Mail.Param[typeof variant]

        // Deliberately not awaited: an SMTP round-trip is slow enough that awaiting
        // it would make the response measurably slower for registered addresses.
        mail.send({
          to: input,

          subject: t(
            mailVariant.subject.__path__,
            { serverName } satisfies Param['subject']
          ),

          content: t(
            mailVariant.content.__path__,
            {
              serverName,
              name: user.name,
              otp,
              link: host(`/mail/verify?t=${token}&a=${variant}`, ctx.h3Event, { fallbackURL: `osu.${ui.baseUrl}` }),
              ttl: Constant.EmailTokenTTLInMinutes as number,
            } satisfies Param['content']
          ),
        }).catch(e => logger.error({ message: `failed to send account recovery mail to ${input}: ${e.message}`, email: input, ip, UA }))

        logger.info(`user ${user.safeName}<${user.id}> requested to change password. OTP sent to ${input} from ${ip}, UA: ${UA}.`, { user: pick(user, ['id', 'name']), email: input, ip, UA })
      }),

    // No session is needed or useful here: the uuid token is the credential.
    // `sessionProcedure` would mint a throwaway session for every prober.
    changePassword: p
      .input(object({
        password: string(),
        repeatPassword: string(),
        // Only the uuid token from the recovery mail. The 6-digit code is
        // exchanged for it by `mail.getToken`, which is throttled; accepting
        // { email, otp } here would be a second, unthrottled oracle.
        token: string().uuid(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!input.password) {
          // TODO refine error message
          throwGucchoError(GucchoError.EmptyPassword)
        }
        if (input.password !== input.repeatPassword) {
          throwGucchoError(GucchoError.PasswordNotMatch)
        }

        const ip = getRequestIP(ctx.h3Event, { xForwardedFor: true }) ?? '0.0.0.0'
        const UA = getHeader(ctx.h3Event, 'User-Agent')
        const rec = await mailToken.get({ token: input.token as MBase.Token })

        if (!rec) {
          logger.info(`invalid password reset token from ${ip}, UA: ${UA}.`, { ip })
          throwGucchoError(GucchoError.EmailTokenNotFound)
        }

        const user = await users.getByEmail(rec.email, { scope: Scope.Self })

        await users.changePasswordNoCheck(user, input.password)

        // A session obtained with the old password must not outlive it. Nothing
        // else revokes sessions on a credential change.
        const revoked = await sessions.destroyAllForUser(UserProvider.idToString(user.id))

        logger.info(`user ${user.safeName}<${user.id}> changed password from ${ip}, UA: ${UA}, revoked ${revoked} session(s).`, { user: pick(user, ['id', 'name']), ip })

        // background jobs
        mailToken.deleteAll(rec.email).catch(e => logger.error({ message: `failed to delete mail token: ${e.message}` }))
      }),
  }),

})
