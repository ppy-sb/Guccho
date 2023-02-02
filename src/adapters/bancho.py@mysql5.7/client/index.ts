import * as Parent from '~/adapters/bancho.py/client'
export { prismaClient } from '~/adapters/bancho.py/client'

export const UserRelationshipDataProvider = Parent.UserRelationshipDataProvider
export const ScoreDataProvider = Parent.ScoreDataProvider
export const MapDataProvider = Parent.MapDataProvider
export const StatusProvider = Parent.StatusProvider

export { UserDataProvider } from './user'
export { LeaderboardDataProvider } from './leaderboard'
