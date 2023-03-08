import * as Parent from '~/adapters/bancho.py@mysql5.7/server'

export const LeaderboardProvider = Parent.LeaderboardProvider
export const UserRelationProvider = Parent.UserRelationProvider
export const ScoreProvider = Parent.ScoreProvider
export const MapProvider = Parent.MapProvider
export const StatusProvider = Parent.StatusProvider

export { UserProvider } from './user'
