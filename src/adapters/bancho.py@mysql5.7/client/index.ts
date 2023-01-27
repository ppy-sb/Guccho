import { PrismaClient } from '@prisma/client'

import * as Parent from '~/adapters/bancho.py/client'

export const prismaClient = new PrismaClient()

export const UserRelationshipDataProvider = Parent.UserRelationshipDataProvider
export const ScoreDataProvider = Parent.ScoreDataProvider
export const MapDataProvider = Parent.MapDataProvider

export { UserDataProvider } from './user'
export { LeaderboardDataProvider } from './leaderboard'
