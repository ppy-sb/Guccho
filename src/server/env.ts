import { ok } from 'node:assert'
import type { ZodType, z } from 'zod'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { Logger } from '$base/logger'
import type { validator } from '$active/env'

const logger = Logger.child({ label: 'env' })

export function ensureAndGetEnv<Z extends ZodType>(zod: Z): z.infer<Z> {
  try {
    return zod.parse(process.env)
  }
  catch (e) {
    if (!(e instanceof ZodError)) {
      logger.error(e)
      throw e
    }
    const formattedZodError = fromZodError(
      e,
      {
        prefix: 'env validation error:\n',
        prefixSeparator: '',
        issueSeparator: ';\n',
        unionSeparator: ',\n',
      }
    )
    logger.error(formattedZodError)
    throw new Error(
      formattedZodError.message
    )
  }
}

export type ActiveBackendConfig = z.infer<typeof validator>
export function defineBackendConfig(input: ActiveBackendConfig) {
  return input
}

export function env(key: string) {
  return (ok(process.env[key]), process.env[key] as NonNullable<typeof process.env[typeof key]>)
}
export function safeEnv(key: string) {
  return process.env[key]
}
