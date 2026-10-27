import { randomInt } from 'node:crypto'
import { v4 } from 'uuid'
import { type Tag } from '~/def/internal-utils'

export namespace MailTokenProvider {
  export type Email = Tag<string, 'email'>
  export type OTP = Tag<string, 'otp'>
  export type Token = Tag<string, 'token'>

  export type Validation =
  | {
    token: Token
  }
  | {
    email: Email
    otp: OTP
  }
}

export interface AttemptWindow {
  max: number
  windowSeconds: number
}

export abstract class MailTokenProvider {
  abstract getOrCreate(email: MailTokenProvider.Email): Promise<{ otp: MailTokenProvider.OTP; token: MailTokenProvider.Token }>
  abstract get(input: MailTokenProvider.Validation): Promise<{ otp: MailTokenProvider.OTP; token: MailTokenProvider.Token; email: MailTokenProvider.Email } | undefined>
  abstract getByEmail(email: MailTokenProvider.Email): Promise<{ otp: MailTokenProvider.OTP; token: MailTokenProvider.Token } | undefined>
  abstract delete(input: MailTokenProvider.Validation): Promise<void>
  abstract deleteAll(email: MailTokenProvider.Email): Promise<void>

  /**
   * Count an attempt against a caller-chosen key and return the new count.
   * Backs the OTP verification throttle: a 6-digit code is walkable without one.
   */
  abstract countAttempt(key: string, window: AttemptWindow): Promise<number>
  abstract clearAttempts(key: string): Promise<void>

  protected generateOTP(): MailTokenProvider.OTP {
    // Not Math.random(): the code is a credential and must not be predictable
    // from other outputs of the same PRNG.
    return randomInt(100_000, 1_000_000).toString() as MailTokenProvider.OTP
  }

  protected generateToken() {
    return v4() as MailTokenProvider.Token
  }
}
