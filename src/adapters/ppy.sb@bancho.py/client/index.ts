import type { PrismaClient as ImportedPrismaClient } from '.prisma/ppy.sb'
import * as Parent from '~/adapters/bancho.py@mysql5.7/client'
import { createCursedRequire } from '~/utils/server'

const require = createCursedRequire(import.meta.url ?? __filename)
const { PrismaClient } = require<{ PrismaClient: typeof ImportedPrismaClient }>('.prisma/ppy.sb')

export const prismaClient = new PrismaClient()

export const LeaderboardProvider = Parent.LeaderboardProvider
export const UserRelationProvider = Parent.UserRelationProvider
export const ScoreProvider = Parent.ScoreProvider
export const MapProvider = Parent.MapProvider
export const StatusProvider = Parent.StatusProvider

export { UserProvider } from './user'
