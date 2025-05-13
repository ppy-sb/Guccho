import {
  AdminMapProvider,
  AdminScoreProvider,
  AdminUserProvider,
  ArticleProvider,
  ChatProvider,
  ClanProvider,
  FileProvider,
  LogProvider,
  MailProvider,
  MailTokenProvider,
  MapProvider,
  MonitorProvider,
  RankProvider,
  ScoreProvider,
  SessionProvider,
  UserProvider,
  UserRelationProvider,
} from '$active/server'

import { type Id, type ScoreId } from '$active'

import {
  type AdminMapProvider as BaseAdminMapProvider,
  type AdminUserProvider as BaseAdminUserProvider,
  type ArticleProvider as BaseArticleProvider,
  type ChatProvider as BaseChatProvider,
  type ClanProvider as BaseClanProvider,
  type FileProvider as BaseFileProvider,
  type MailProvider as BaseMailProvider,
  type MailTokenProvider as BaseMailTokenProvider,
  type MapProvider as BaseMapProvider,
  type MonitorProvider as BaseMonitorProvider,
  type RankProvider as BaseRankProvider,
  type ScoreProvider as BaseScoreProvider,
  type UserProvider as BaseUserProvider,
  type UserRelationProvider as BaseUserRelationProvider,
} from '$base/server'

import { type AdminScoreProvider as BaseAdminScoreProvider } from '$base/server/admin/score'

export const articles: BaseArticleProvider = new ArticleProvider()
export const adminMap: BaseAdminMapProvider<Id, any> = new AdminMapProvider()
export const adminUser: BaseAdminUserProvider<Id> = new AdminUserProvider()
export const adminScore: BaseAdminScoreProvider<Id> = new AdminScoreProvider()
export const chats: BaseChatProvider<Id> = new ChatProvider()
export const files: BaseFileProvider<Id, ScoreId> = new FileProvider()
export const logs = new LogProvider()
export const maps: BaseMapProvider<Id, Id> = new MapProvider()
export const monitor: BaseMonitorProvider = new MonitorProvider()
export const ranks: BaseRankProvider<Id> = new RankProvider()
export const scores: BaseScoreProvider<ScoreId, Id> = new ScoreProvider()
export const sessions = new SessionProvider()
export const users: BaseUserProvider<Id, ScoreId> = new UserProvider()
export const userRelations: BaseUserRelationProvider<Id> = new UserRelationProvider()
export const clanProvider: BaseClanProvider<Id> = new ClanProvider()
export const mail: BaseMailProvider = new MailProvider()
export const mailToken: BaseMailTokenProvider = new MailTokenProvider()

export {
  AdminUserProvider,
  AdminMapProvider,
  ArticleProvider,
  ChatProvider,
  ClanProvider,
  FileProvider,
  LogProvider,
  MailTokenProvider,
  MapProvider,
  MonitorProvider,
  RankProvider,
  ScoreProvider,
  SessionProvider,
  UserProvider,
  UserRelationProvider,
} from '$active/server'
