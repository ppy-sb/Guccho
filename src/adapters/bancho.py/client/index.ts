import {
  PrismaClient
} from '@prisma/client'

export const prismaClient = new PrismaClient()
export * from './user'
export * from './user-relations'
export * from './leaderboard'
