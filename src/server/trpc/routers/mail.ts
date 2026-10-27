import { router as _router, publicProcedure } from '../trpc'
import { zodEmailValidation } from '../shapes'
import { mailToken } from '~/server/singleton/service'
import { Logger } from '$base/logger'

const logger = Logger.child({ label: 'mail' })

// A 6-digit code is walkable at a few hundred requests per second. This query is
// the only place an OTP is checked, so throttling it per mailbox and per caller
// (not per session: `sessionProcedure` hands out a fresh session to any
// cookieless request, so a session is not an identity) closes the brute force.
const OTP_EMAIL_WINDOW = { max: 5, windowSeconds: 15 * 60 }
const OTP_IP_WINDOW = { max: 50, windowSeconds: 15 * 60 }

// The blocked path answers exactly like a wrong code, so this log line is the
// only trace of a flood — which made it a liability: one line per retry, and
// 200k retries ≈ 60 MB rotated the audit trail out of `.logs/` on 2026-10-27.
// Log the crossing of the limit and then one line per thousand attempts, so the
// volume stays bounded no matter how hard the caller hammers. The counters are
// per window (`countAttempt` INCRs a key that expires with the window), so this
// is one line per key per window plus a heartbeat.
const OTP_FLOOD_LOG_EVERY = 1_000

function worthLoggingThrottle(attempts: number, max: number): boolean {
  return attempts === max + 1 || (attempts > max && attempts % OTP_FLOOD_LOG_EVERY === 0)
}

export const router = _router({
  getToken: publicProcedure
    .input(zodEmailValidation)
    .query(async ({ input, ctx }) => {
      // The { token } form carries a 122-bit uuid and cannot be guessed; only
      // the { email, otp } form is brute-forceable.
      if (!('email' in input)) {
        return await mailToken.get(input)
      }

      const email = input.email
      const ip = getRequestIP(ctx.h3Event, { xForwardedFor: true }) ?? '0.0.0.0'
      const UA = getHeader(ctx.h3Event, 'User-Agent')

      const [byEmail, byIp] = await Promise.all([
        mailToken.countAttempt(`otp:email:${email}`, OTP_EMAIL_WINDOW),
        mailToken.countAttempt(`otp:ip:${ip}`, OTP_IP_WINDOW),
      ])

      if (byEmail > OTP_EMAIL_WINDOW.max || byIp > OTP_IP_WINDOW.max) {
        if (
          worthLoggingThrottle(byEmail, OTP_EMAIL_WINDOW.max)
          || worthLoggingThrottle(byIp, OTP_IP_WINDOW.max)
        ) {
          logger.warn(`otp exchange throttled for ${email} from ${ip}, UA: ${UA}.`, { email, ip, attempts: byEmail, ipAttempts: byIp })
        }
        // Same shape as a wrong code: do not tell a prober that it was the limiter.
        return
      }

      const rec = await mailToken.get({ email, otp: input.otp })

      if (!rec) {
        logger.info(`incorrect otp for ${email} from ${ip}, UA: ${UA}.`, { email, ip })
        return
      }

      await mailToken.clearAttempts(`otp:email:${email}`)
      return rec
    }),
})
