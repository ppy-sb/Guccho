import type { PrismaClient as ImportedPrismaClient } from '.prisma/ppy.sb'
// import { prismaErrorHandler } from '~/adapters/bancho.py/server/prisma'
import { createCursedRequire } from '~/server'

const require = createCursedRequire(import.meta.url ?? __filename)
const { PrismaClient } = require<{
  PrismaClient: typeof ImportedPrismaClient
}>('.prisma/ppy.sb')

export const prismaClient = new PrismaClient()
