import type { ZodType } from 'zod'
import type z from 'zod'
import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'

export function ensureEnv<Z extends ZodType>(zod: Z) {
  ensureAndGetEnv(zod)
}

export function ensureAndGetEnv<Z extends ZodType>(zod: Z): z.infer<Z> {
  try {
    return zod.parse(process.env)
  }
  catch (e) {
    if (!(e instanceof ZodError)) {
      throw e
    }
    throw new Error(
      fromZodError(
        e,
        {
          prefix: 'env validation error:\n',
          prefixSeparator: '',
          issueSeparator: ';\n',
          unionSeparator: ',\n',
        }
      ).message
    )
  }
}
