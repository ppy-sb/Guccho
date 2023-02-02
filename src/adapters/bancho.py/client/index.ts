import type { PrismaClient as ImportedPrismaClient } from '.prisma/bancho.py'
import { createCursedRequire } from '~/utils/cursed'
const require = createCursedRequire(import.meta.url ?? __filename)
const { PrismaClient } = require<{ PrismaClient: typeof ImportedPrismaClient }>('.prisma/bancho.py')

export const prismaClient = new PrismaClient()
export { default as UserDataProvider } from './user'
export { default as UserRelationshipDataProvider } from './user-relations'
export { default as LeaderboardDataProvider } from './leaderboard'
export { default as MapDataProvider } from './map' // bancho.py
export { default as ScoreDataProvider } from './score'
export { StatusProvider } from './status'
