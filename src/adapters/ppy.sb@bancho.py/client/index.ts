import {
  PrismaClient,
} from '@prisma/client' // ppy.sb
import * as Parent from '~/adapters/bancho.py@mysql5.7/client'

export const prismaClient = new PrismaClient()

export const LeaderboardDataProvider = Parent.LeaderboardDataProvider
export const UserRelationshipDataProvider = Parent.UserRelationshipDataProvider
export const ScoreDataProvider = Parent.ScoreDataProvider
export const MapDataProvider = Parent.MapDataProvider

export { UserDataProvider } from './user'
