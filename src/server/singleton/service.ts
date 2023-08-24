import {
  ArticleProvider,
  LogProvider,
  MapProvider,
  MonitorProvider,
  RankProvider,
  ScoreProvider,
  SessionProvider,
  UserProvider,
  UserRelationProvider,
} from '$active/server'

export const articles = new ArticleProvider()
export const userRelations = new UserRelationProvider()
export const users = new UserProvider()
export const sessions = new SessionProvider()
export const logs = new LogProvider()
export const maps = new MapProvider()
export const ranks = new RankProvider()
export const scores = new ScoreProvider()
export const serviceStatuses = new MonitorProvider()
