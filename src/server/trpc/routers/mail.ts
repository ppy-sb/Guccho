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
        logger.warn(`otp exchange throttled for ${email} from ${ip}, UA: ${UA}.`, { email, ip, attempts: byEmail, ipAttempts: byIp })
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
