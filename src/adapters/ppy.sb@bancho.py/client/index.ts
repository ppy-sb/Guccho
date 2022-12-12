import * as BanchoPy from '~/adapters/bancho.py/client'

import {
  PrismaClient,
} from '~/.prisma/ppy.sb/index'

export const prismaClient = new PrismaClient()

export const LeaderboardDataProvider = BanchoPy.LeaderboardDataProvider
export const UserRelationshipDataProvider = BanchoPy.UserRelationshipDataProvider
// export const UserDataProvider = BanchoPy.UserDataProvider
export { UserDataProvider } from './user'
export const MapDataProvider = BanchoPy.MapDataProvider
