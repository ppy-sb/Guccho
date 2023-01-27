import type { PrismaClient as ImportedPrismaClient } from '.prisma/ppy.sb'
import * as Parent from '~/adapters/bancho.py@mysql5.7/client'

import { createCursedRequire } from '~/utils/cursed'
const require = createCursedRequire(import.meta.url ?? __filename)
const { PrismaClient } = require<{ PrismaClient: typeof ImportedPrismaClient }>('.prisma/ppy.sb')

export const prismaClient = new PrismaClient()

export const LeaderboardDataProvider = Parent.LeaderboardDataProvider
export const UserRelationshipDataProvider = Parent.UserRelationshipDataProvider
export const ScoreDataProvider = Parent.ScoreDataProvider
export const MapDataProvider = Parent.MapDataProvider

export { UserDataProvider } from './user'
