import { createRequire } from 'module'
import type { PrismaClient as ImportedPrismaClient } from '.prisma/bancho.py'
const require = createRequire(import.meta.url ?? __filename)
const { PrismaClient: RequiredPrismaClient } = require('.prisma/bancho.py')
const _PrismaClient: typeof ImportedPrismaClient = RequiredPrismaClient
export class PrismaClient extends _PrismaClient {}

export const prismaClient = new PrismaClient()
export { default as UserDataProvider } from './user'
export { default as UserRelationshipDataProvider } from './user-relations'
export { default as LeaderboardDataProvider } from './leaderboard'
export { default as MapDataProvider } from './map' // bancho.py
export { default as ScoreDataProvider } from './score'
