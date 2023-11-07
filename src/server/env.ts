import process from 'node:process'
import { ZodError, type ZodType, type infer as infer_ } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { Logger } from '$base/logger'
import type { validator } from '$active/env'

const logger = Logger.child({ label: 'env' })

export function ensureAndGetEnv<Z extends ZodType>(zod: Z): infer_<Z> {
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
      },
    )
    logger.error(formattedZodError)
    throw new Error(
      formattedZodError.message,
    )
  }
}

export type ActiveBackendConfig = infer_<typeof validator>
