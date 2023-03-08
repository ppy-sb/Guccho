import type { PrismaClient as ImportedPrismaClient } from '.prisma/bancho.py'
import { createCursedRequire } from '~/utils/server'

const require = createCursedRequire(import.meta.url ?? __filename)
const { PrismaClient } = require<{ PrismaClient: typeof ImportedPrismaClient }>('.prisma/bancho.py')

export const prismaClient = new PrismaClient()
export { LeaderboardProvider } from './leaderboard'
export { MapProvider } from './map'
export { ScoreProvider } from './score'
export { StatusProvider } from './status'
export { UserProvider } from './user'
export { UserRelationProvider } from './user-relations'
