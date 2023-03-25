import { TRPCError } from '@trpc/server'
import type { PrismaClient as ImportedPrismaClient } from '.prisma/bancho.py'
import type { PrismaClientExtensionError, PrismaClientInitializationError, PrismaClientKnownRequestError } from '.prisma/bancho.py/runtime'
import { createCursedRequire } from '~/server'

const require = createCursedRequire(import.meta.url ?? __filename)
const { PrismaClient, Prisma } = require<{
  PrismaClient: typeof ImportedPrismaClient
  Prisma: {
    PrismaClientExtensionError: typeof PrismaClientExtensionError
    PrismaClientInitializationError: typeof PrismaClientInitializationError
    PrismaClientKnownRequestError: typeof PrismaClientKnownRequestError
  }
}>('.prisma/bancho.py')

export const prismaErrorHandler = (cb: (e: unknown) => Error) => (e: unknown) => {
  if (
    e instanceof Prisma.PrismaClientInitializationError
    || e instanceof Prisma.PrismaClientKnownRequestError
    || e instanceof Prisma.PrismaClientExtensionError
  ) {
    return new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: e.message,
      cause: e.name,
    })
  }
  return cb(e)
}

let prismaClientInstance: ImportedPrismaClient
export const getPrismaClient = () => {
  if (!prismaClientInstance) {
    prismaClientInstance = new PrismaClient()
  }
  return prismaClientInstance
}
