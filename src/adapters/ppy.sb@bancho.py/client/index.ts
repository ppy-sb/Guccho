import { createRequire } from 'module'
import type { PrismaClient as ImportedPrismaClient } from '.prisma/ppy.sb'
import * as Parent from '~/adapters/bancho.py@mysql5.7/client'
const require = createRequire(import.meta.url ?? __filename)
const { PrismaClient: RequiredPrismaClient } = require('.prisma/ppy.sb')
const _PrismaClient: typeof ImportedPrismaClient = RequiredPrismaClient
export class PrismaClient extends _PrismaClient {}
export const prismaClient = new PrismaClient()

export const LeaderboardDataProvider = Parent.LeaderboardDataProvider
export const UserRelationshipDataProvider = Parent.UserRelationshipDataProvider
export const ScoreDataProvider = Parent.ScoreDataProvider
export const MapDataProvider = Parent.MapDataProvider

export { UserDataProvider } from './user'
