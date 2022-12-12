import {
  PrismaClient,
} from '~/.prisma/bancho.py/index'

export const prismaClient = new PrismaClient()
export { default as UserDataProvider } from './user'
export { default as UserRelationshipDataProvider } from './user-relations'
export { default as LeaderboardDataProvider } from './leaderboard'
export { default as MapDataProvider } from './map'
