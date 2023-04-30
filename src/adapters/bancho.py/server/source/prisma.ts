import { fromZodError } from 'zod-validation-error'
import type { ZodError } from 'zod'
import * as z from 'zod'

import type { PrismaClient as ImportedPrismaClient } from '.prisma/bancho.py'
import { createCursedRequire } from '~/server'

export const validator = z.object({
  BANCHO_PY_DB_DSN: z.string(),
})

export function ensureAndGetDBEnv() {
  try {
    return validator.parse(process.env)
  }
  catch (e) {
    throw new Error(
      fromZodError(
        e as ZodError,
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

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof validator> { }
  }
}

const require = createCursedRequire(import.meta.url ?? __filename)
const { PrismaClient } = require<{ PrismaClient: typeof ImportedPrismaClient }>('.prisma/bancho.py')

let prismaClientInstance: ImportedPrismaClient
export function getPrismaClient() {
  if (!prismaClientInstance) {
    prismaClientInstance = new PrismaClient()
  }
  return prismaClientInstance
}
