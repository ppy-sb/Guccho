import { and, eq, gte, lte, or } from 'drizzle-orm'
import * as schema from '../drizzle/schema'
import { useDrizzle } from './source/drizzle'
import { client as getRedis } from './source/redis'
import { type AttemptWindow, MailTokenProvider as MBase } from '$base/server/mail-token'
import { Constant } from '~/server/common/constants'

const ATTEMPT_PREFIX = 'guccho:attempt:'

export class MailTokenProvider extends MBase {
  drizzle = useDrizzle(schema)

  async getOrCreate(email: MBase.Email): Promise<{ otp: MBase.OTP; token: MBase.Token }> {
    const saved = await this.getByEmail(email)
    if (!saved) {
      return await this.create(email)
    }

    // Deliberately no ttl extension: a token is valid for a fixed window from
    // creation. Extending it on every request lets an attacker keep the same
    // 6-digit code alive for as long as it takes to enumerate it.
    return saved
  }

  async countAttempt(key: string, window: AttemptWindow): Promise<number> {
    const redisKey = ATTEMPT_PREFIX + key
    const count = await getRedis().incr(redisKey)
    if (count === 1) {
      await getRedis().expire(redisKey, window.windowSeconds)
    }
    return count
  }

  async clearAttempts(key: string): Promise<void> {
    await getRedis().del(ATTEMPT_PREFIX + key)
  }

  async get(input: MBase.Validation): Promise<{ email: MBase.Email; otp: MBase.OTP; token: MBase.Token } | undefined> {
    const tokens = await this.getTokens(input)

    return tokens?.at(-1)
  }

  async deleteAll(email: MBase.Email) {
    await this.drizzle.delete(schema.emailTokens).where(eq(schema.emailTokens.email, email))
  }

  async delete(input: MBase.Validation) {
    const date = new Date()
    await this.drizzle.delete(schema.emailTokens).where(and(
      or(
        'email' in input && 'otp' in input
          ? and(
            eq(schema.emailTokens.email, input.email),
            eq(schema.emailTokens.otp, input.otp)
          )
          : undefined,

        'token' in input
          ? eq(schema.emailTokens.token, input.token)
          : undefined
      ),

      lte(schema.emailTokens.invalidAfter, date),
    ))
  }

  async getByEmail(email: MBase.Email): Promise<{ otp: MBase.OTP; token: MBase.Token } | undefined> {
    const date = new Date()
    const tokens = await this.drizzle.query.emailTokens.findMany({
      where: and(
        eq(schema.emailTokens.email, email),

        gte(schema.emailTokens.invalidAfter, date),
        lte(schema.emailTokens.invalidAfter, this.offsetByMinutes(Constant.EmailTokenTTLInMinutes, date))
      ),
    })

    const rec = tokens?.at(-1)
    if (!rec) {
      return undefined
    }

    return pick(rec, ['otp', 'token']) as { otp: MBase.OTP; token: MBase.Token } | undefined
  }

  protected async create(email: MBase.Email): Promise<{ otp: MBase.OTP; token: MBase.Token }> {
    const otp = this.generateOTP()
    const token = this.generateToken()

    await this.drizzle.insert(schema.emailTokens).values({
      email,
      otp,
      token,
      invalidAfter: this.offsetByMinutes(+15),
    })

    return { otp, token }
  }

  protected offsetByMinutes(offset: number, date: Date = new Date()) {
    const dt = new Date(date)
    dt.setMinutes(dt.getMinutes() + offset)
    return dt
  }

  protected async getTokens(input: MBase.Validation): Promise<{ email: MBase.Email; otp: MBase.OTP; token: MBase.Token }[]> {
    const date = new Date()
    return await this.drizzle.query.emailTokens.findMany({
      where: and(
        or(
          'email' in input && 'otp' in input
            ? and(
              eq(schema.emailTokens.email, input.email),
              eq(schema.emailTokens.otp, input.otp)
            )
            : undefined,

          'token' in input
            ? eq(schema.emailTokens.token, input.token)
            : undefined
        ),

        gte(schema.emailTokens.invalidAfter, date),
        lte(schema.emailTokens.invalidAfter, this.offsetByMinutes(Constant.EmailTokenTTLInMinutes, date))
      ),
      columns: {
        email: true,
        otp: true,
        token: true,
      },
    }) as { email: MBase.Email; otp: MBase.OTP; token: MBase.Token }[]
  }
}
