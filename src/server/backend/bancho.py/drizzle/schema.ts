import { bigint, boolean, char, date, datetime, index, int, mysqlEnum, mysqlTable, primaryKey, tinyint, unique, varchar } from 'drizzle-orm/mysql-core'
import { relations, sql } from 'drizzle-orm'
import { decimal } from './fixed-point'

const bpyServerEnum = mysqlEnum('server', ['osu!', 'private'])

export const achievements = mysqlTable('achievements', {
  id: int('id').autoincrement().notNull(),
  file: varchar('file', { length: 128 }).notNull(),
  name: varchar('name', { length: 128 }).notNull(),
  desc: varchar('desc', { length: 256 }).notNull(),
  cond: varchar('cond', { length: 64 }).notNull(),
},
(table) => {
  return {
    achievementsIdPk: primaryKey({ columns: [table.id], name: 'achievements_id_pk' }),
    achievementsDescUindex: unique('achievements_desc_uindex').on(table.desc),
    achievementsFileUindex: unique('achievements_file_uindex').on(table.file),
    achievementsNameUindex: unique('achievements_name_uindex').on(table.name),
  }
})

export const channels = mysqlTable('channels', {
  id: int('id').autoincrement().notNull(),
  name: varchar('name', { length: 32 }).notNull(),
  topic: varchar('topic', { length: 256 }).notNull(),
  readPriv: int('read_priv').default(1).notNull(),
  writePriv: int('write_priv').default(2).notNull(),
  autoJoin: boolean('auto_join').default(false).notNull(),
},
(table) => {
  return {
    channelsIdPk: primaryKey({ columns: [table.id], name: 'channels_id_pk' }),
    channelsNameUindex: unique('channels_name_uindex').on(table.name),
  }
})

export const clans = mysqlTable('clans', {
  id: int('id').autoincrement().notNull(),
  name: varchar('name', { length: 16 }).notNull(),
  badge: varchar('tag', { length: 6 }).notNull(),
  ownerId: int('owner').notNull(),
  createdAt: datetime('created_at', { mode: 'date' }).notNull(),
},
(table) => {
  return {
    clansIdPk: primaryKey({ columns: [table.id], name: 'clans_id_pk' }),
    clansNameUindex: unique('clans_name_uindex').on(table.name),
    clansOwnerUindex: unique('clans_owner_uindex').on(table.ownerId),
    clansTagUindex: unique('clans_tag_uindex').on(table.badge),
  }
})

export const clientHashes = mysqlTable('client_hashes', {
  userId: int('userid').notNull(),
  osuPath: char('osupath', { length: 32 }).notNull(),
  adapters: char('adapters', { length: 32 }).notNull(),
  uninstallId: char('uninstall_id', { length: 32 }).notNull(),
  diskSerial: char('disk_serial', { length: 32 }).notNull(),
  latestTime: datetime('latest_time', { mode: 'date' }).notNull(),
  occurrences: int('occurrences').default(0).notNull(),
},
(table) => {
  return {
    clientHashesUseridOsuPathAdaptersUninstallIdDiskSerialPk: primaryKey({ columns: [table.userId, table.osuPath, table.adapters, table.uninstallId, table.diskSerial], name: 'client_hashes_userid_osupath_adapters_uninstall_id_disk_serial_pk' }),
  }
})

export const comments = mysqlTable('comments', {
  id: int('id').autoincrement().notNull(),
  targetId: int('target_id').notNull(),
  targetType: mysqlEnum('target_type', ['replay', 'map', 'song']).notNull(),
  userId: int('userid').notNull(),
  time: int('time').notNull(),
  comment: varchar('comment', { length: 80 }).notNull(),
  colour: char('colour', { length: 6 }),
},
(table) => {
  return {
    userIdFkey: index('comments_userid_fkey').on(table.userId),
    commentsIdPk: primaryKey({ columns: [table.id], name: 'comments_id_pk' }),
  }
})

export const favourites = mysqlTable('favourites', {
  userId: int('userid').notNull(),
  setId: int('setid').notNull(),
  createdAt: int('created_at').default(0).notNull(),
},
(table) => {
  return {
    favouritesUseridSetIdPk: primaryKey({ columns: [table.userId, table.setId], name: 'favourites_userid_setid_pk' }),
  }
})

export const ingameLogins = mysqlTable('ingame_logins', {
  id: int('id').autoincrement().notNull(),
  userId: int('userid').notNull(),
  ip: varchar('ip', { length: 45 }).notNull(),
  // you can use { mode: 'date' }, if you want to have Date as type for this column
  osuVer: date('osu_ver', { mode: 'string' }).notNull(),
  osuStream: varchar('osu_stream', { length: 128 }).notNull(),
  datetime: datetime('datetime', { mode: 'date' }).notNull(),
},
(table) => {
  return {
    ingameLoginsIdPk: primaryKey({ columns: [table.id], name: 'ingame_logins_id_pk' }),
  }
})

export const logs = mysqlTable('logs', {
  id: int('id').autoincrement().notNull(),
  from: int('from').notNull(),
  to: int('to').notNull(),
  msg: varchar('msg', { length: 2048 }).notNull(),
  time: datetime('time', { mode: 'date' }).notNull(),
},
(table) => {
  return {
    logsIdPk: primaryKey({ columns: [table.id], name: 'logs_id_pk' }),
  }
})

export const mail = mysqlTable('mail', {
  id: int('id').autoincrement().notNull(),
  fromId: int('from_id').notNull(),
  toId: int('to_id').notNull(),
  msg: varchar('msg', { length: 2048 }).notNull(),
  time: int('time'),
  read: boolean('read').default(false).notNull(),
},
(table) => {
  return {
    mailIdPk: primaryKey({ columns: [table.id], name: 'mail_id_pk' }),
  }
})

export const mapRequests = mysqlTable('map_requests', {
  id: int('id').autoincrement().notNull(),
  mapId: int('map_id').notNull(),
  playerId: int('player_id').notNull(),
  datetime: datetime('datetime', { mode: 'date' }).notNull(),
  active: boolean('active').notNull(),
},
(table) => {
  return {
    mapRequestsIdPk: primaryKey({ columns: [table.id], name: 'map_requests_id_pk' }),
  }
})

export const beatmaps = mysqlTable('maps', {
  id: int('id').notNull(),
  server: bpyServerEnum.default('osu!').notNull(),
  setId: int('set_id').notNull(),
  status: int('status').notNull(),
  md5: char('md5', { length: 32 }).notNull(),
  artist: varchar('artist', { length: 128 }).notNull(),
  title: varchar('title', { length: 128 }).notNull(),
  version: varchar('version', { length: 128 }).notNull(),
  creator: varchar('creator', { length: 19 }).notNull(),
  filename: varchar('filename', { length: 256 }).notNull(),
  lastUpdate: datetime('last_update', { mode: 'date' }).notNull(),
  totalLength: int('total_length').notNull(),
  maxCombo: int('max_combo').notNull(),
  frozen: boolean('frozen').default(false).notNull(),
  plays: int('plays').default(0).notNull(),
  passes: int('passes').default(0).notNull(),
  mode: tinyint('mode').default(0).notNull(),
  // Warning: Can't parse float(12,2) from database
  // float(12,2)Type: float(12,2)("bpm").notNull(),
  bpm: decimal('bpm', { scale: 12, precision: 2 }).notNull(),
  // Warning: Can't parse float(4,2) from database
  // float(4,2)Type: float(4,2)("cs").notNull(),
  cs: decimal('cs', { scale: 4, precision: 2 }).notNull(),
  // Warning: Can't parse float(4,2) from database
  // float(4,2)Type: float(4,2)("ar").notNull(),
  ar: decimal('ar', { scale: 4, precision: 2 }).notNull(),
  // Warning: Can't parse float(4,2) from database
  // float(4,2)Type: float(4,2)("od").notNull(),
  od: decimal('od', { scale: 4, precision: 2 }).notNull(),
  // Warning: Can't parse float(4,2) from database
  // float(4,2)Type: float(4,2)("hp").notNull(),
  hp: decimal('hp', { scale: 4, precision: 2 }).notNull(),
  // Warning: Can't parse float(6,3) from database
  // float(6,3)Type: float(6,3)("diff").notNull(),
  diff: decimal('diff', { scale: 6, precision: 3 }).notNull(),
},
(table) => {
  return {
    filename: index('filename').on(table.filename),
    mapsServerIdPk: primaryKey({ columns: [table.server, table.id], name: 'maps_server_id_pk' }),
    mapsIdUindex: unique('maps_id_uindex').on(table.id),
    mapsMd5Uindex: unique('maps_md5_uindex').on(table.md5),
  }
})

// export const mapsLack = mysqlTable('maps_lack', {
//   md5: varchar('md5', { length: 255 }).notNull(),
//   lackType: varchar('lack_type', { length: 255 }).notNull(),
// },
// (table) => {
//   return {
//     mapsLackMd5Pk: primaryKey({ columns: [table.md5], name: 'maps_lack_md5_pk' }),
//   }
// })

export const sources = mysqlTable('mapsets', {
  server: bpyServerEnum.default('osu!').notNull(),
  id: int('id').notNull(),
  lastOsuApiCheck: datetime('last_osuapi_check', { mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => {
  return {
    mapsetsServerIdPk: primaryKey({ columns: [table.server, table.id], name: 'mapsets_server_id_pk' }),
    nmapsetsIdUindex: unique('nmapsets_id_uindex').on(table.id),
  }
})

export const performanceReports = mysqlTable('performance_reports', {
  scoreId: bigint('scoreid', { mode: 'bigint', unsigned: true }).notNull(),
  modMode: mysqlEnum('mod_mode', ['vanilla', 'relax', 'autopilot']).default('vanilla').notNull(),
  os: varchar('os', { length: 64 }).notNull(),
  fullscreen: boolean('fullscreen').notNull(),
  fpsCap: varchar('fps_cap', { length: 16 }).notNull(),
  compatibility: boolean('compatibility').notNull(),
  version: varchar('version', { length: 16 }).notNull(),
  startTime: int('start_time').notNull(),
  endTime: int('end_time').notNull(),
  frameCount: int('frame_count').notNull(),
  spikeFrames: int('spike_frames').notNull(),
  aimRate: int('aim_rate').notNull(),
  completion: boolean('completion').notNull(),
  identifier: varchar('identifier', { length: 128 }),
  averageFrametime: int('average_frametime').notNull(),
},
(table) => {
  return {
    performanceReportsScoreIdModModePk: primaryKey({ columns: [table.scoreId, table.modMode], name: 'performance_reports_scoreid_mod_mode_pk' }),
  }
})

export const ratings = mysqlTable('ratings', {
  userId: int('userid').notNull(),
  mapMd5: char('map_md5', { length: 32 }).notNull(),
  rating: tinyint('rating').notNull(),
},
(table) => {
  return {
    ratingsUseridMapMd5Pk: primaryKey({ columns: [table.userId, table.mapMd5], name: 'ratings_userid_map_md5_pk' }),
  }
})

export const relationships = mysqlTable('relationships', {
  fromUser: int('user1').notNull(),
  toUser: int('user2').notNull(),
  type: mysqlEnum('type', ['friend', 'block']).notNull(),
},
(table) => {
  return {
    relationshipsFromUserToUserPk: primaryKey({ columns: [table.fromUser, table.toUser], name: 'relationships_user1_user2_pk' }),
  }
})

export const scores = mysqlTable('scores', {
  id: bigint('id', { mode: 'bigint', unsigned: true }).autoincrement().notNull(),
  mapMd5: char('map_md5', { length: 32 }).notNull(),
  score: int('score').notNull(),
  // Warning: Can't parse float(7,3) from database
  // float(7,3)Type: float(7,3)("pp").notNull(),
  pp: decimal('pp', { scale: 7, precision: 3 }).notNull(),
  // Warning: Can't parse float(6,3) from database
  // float(6,3)Type: float(6,3)("acc").notNull(),
  accuracy: decimal('acc', { scale: 6, precision: 3 }).notNull(),
  maxCombo: int('max_combo').notNull(),
  mods: int('mods').notNull(),
  n300: int('n300').notNull(),
  n100: int('n100').notNull(),
  n50: int('n50').notNull(),
  nMiss: int('nmiss').notNull(),
  nGeki: int('ngeki').notNull(),
  nKatu: int('nkatu').notNull(),
  grade: varchar('grade', { length: 2 }).default('N').notNull(),
  status: tinyint('status').notNull(),
  mode: tinyint('mode').notNull(),
  playTime: datetime('play_time', { mode: 'date' }).notNull(),
  timeElapsed: int('time_elapsed').notNull(),
  clientFlags: int('client_flags').notNull(),
  userId: int('userid').notNull(),
  perfect: boolean('perfect').notNull(),
  onlineChecksum: char('online_checksum', { length: 32 }).notNull(),
},
(table) => {
  return {
    mapMd5: index('map_md5').on(table.mapMd5),
    userId: index('userid').on(table.userId),
    scoresIdPk: primaryKey({ columns: [table.id], name: 'scores_id_pk' }),
  }
})

export const startups = mysqlTable('startups', {
  id: int('id').autoincrement().notNull(),
  verMajor: tinyint('ver_major').notNull(),
  verMinor: tinyint('ver_minor').notNull(),
  verMicro: tinyint('ver_micro').notNull(),
  datetime: datetime('datetime', { mode: 'date' }).notNull(),
},
(table) => {
  return {
    startupsIdPk: primaryKey({ columns: [table.id], name: 'startups_id_pk' }),
  }
})

export const stats = mysqlTable('stats', {
  id: int('id').notNull(),
  mode: tinyint('mode').notNull(),
  totalScore: bigint('tscore', { mode: 'bigint', unsigned: true }).notNull(),
  rankedScore: bigint('rscore', { mode: 'bigint', unsigned: true }).notNull(),
  pp: int('pp', { unsigned: true }).default(0).notNull(),
  plays: int('plays', { unsigned: true }).default(0).notNull(),
  playTime: int('playtime', { unsigned: true }).default(0).notNull(),
  accuracy: decimal('acc', { scale: 6, precision: 3 }).notNull(),
  maxCombo: int('max_combo', { unsigned: true }).default(0).notNull(),
  totalHits: int('total_hits', { unsigned: true }).default(0).notNull(),
  replayViews: int('replay_views', { unsigned: true }).default(0).notNull(),
  xhCount: int('xh_count', { unsigned: true }).default(0).notNull(),
  xCount: int('x_count', { unsigned: true }).default(0).notNull(),
  shCount: int('sh_count', { unsigned: true }).default(0).notNull(),
  sCount: int('s_count', { unsigned: true }).default(0).notNull(),
  aCount: int('a_count', { unsigned: true }).default(0).notNull(),
},
(table) => {
  return {
    statsIdModePk: primaryKey({ columns: [table.id, table.mode], name: 'stats_id_mode_pk' }),
  }
})

export const tourneyPoolMaps = mysqlTable('tourney_pool_maps', {
  mapId: int('map_id').notNull(),
  poolId: int('pool_id').notNull(),
  mods: int('mods').notNull(),
  slot: tinyint('slot').notNull(),
},
(table) => {
  return {
    tourneyPoolsIdFk: index('tourney_pool_maps_tourney_pools_id_fk').on(table.poolId),
    tourneyPoolMapsMapIdPoolIdPk: primaryKey({ columns: [table.mapId, table.poolId], name: 'tourney_pool_maps_map_id_pool_id_pk' }),
  }
})

export const tourneyPools = mysqlTable('tourney_pools', {
  id: int('id').autoincrement().notNull(),
  name: varchar('name', { length: 16 }).notNull(),
  createdAt: datetime('created_at', { mode: 'date' }).notNull(),
  createdBy: int('created_by').notNull(),
},
(table) => {
  return {
    usersIdFk: index('tourney_pools_users_id_fk').on(table.createdBy),
    tourneyPoolsIdPk: primaryKey({ columns: [table.id], name: 'tourney_pools_id_pk' }),
  }
})

export const userAchievements = mysqlTable('user_achievements', {
  userId: int('userid').notNull(),
  achievementId: int('achid').notNull(),
},
(table) => {
  return {
    userAchievementsUserIdAchievementIdPk: primaryKey({ columns: [table.userId, table.achievementId], name: 'user_achievements_userid_achid_pk' }),
  }
})

export const users = mysqlTable('users', {
  id: int('id').autoincrement().notNull(),
  name: varchar('name', { length: 32 }).notNull(),
  safeName: varchar('safe_name', { length: 32 }).notNull(),
  email: varchar('email', { length: 254 }).notNull(),
  priv: int('priv').default(1).notNull(),
  pwBcrypt: char('pw_bcrypt', { length: 60 }).notNull(),
  country: char('country', { length: 2 }).default('xx').notNull(),
  silenceEnd: int('silence_end').default(0).notNull(),
  donorEnd: int('donor_end').default(0).notNull(),
  creationTime: int('creation_time').default(0).notNull(),
  lastActivity: int('latest_activity').default(0).notNull(),
  preferredMode: int('preferred_mode').default(0).notNull(),
  playStyle: int('play_style').default(0).notNull(),
  customBadgeName: varchar('custom_badge_name', { length: 16 }),
  customBadgeIcon: varchar('custom_badge_icon', { length: 64 }),
  userpageContent: varchar('userpage_content', { length: 2048 }),
  clanId: int('clan_id').default(0).notNull(),
  clanPriv: tinyint('clan_priv').default(0).notNull(),
  apiKey: char('api_key', { length: 36 }),
},
(table) => {
  return {
    clanIdFkey: index('users_clan_id_fkey').on(table.clanId),
    usersIdPk: primaryKey({ columns: [table.id], name: 'users_id_pk' }),
    usersApiKeyUindex: unique('users_api_key_uindex').on(table.apiKey),
    usersEmailUindex: unique('users_email_uindex').on(table.email),
    usersNameUindex: unique('users_name_uindex').on(table.name),
    usersSafeNameUindex: unique('users_safe_name_uindex').on(table.safeName),
  }
})

export const clientHashesRelations = relations(clientHashes, ({ one }) => ({
  user: one(users, { fields: [clientHashes.userId], references: [users.id] }),
}))
export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
}))
export const favouritesRelations = relations(favourites, ({ one }) => ({
  user: one(users, { fields: [favourites.userId], references: [users.id] }),
  beatmapset: one(sources, { fields: [favourites.setId], references: [sources.id] }),
}))
export const ingameLoginsRelations = relations(ingameLogins, ({ one }) => ({
  user: one(users, { fields: [ingameLogins.userId], references: [users.id] }),
}))
export const mailRelations = relations(mail, ({ one }) => ({
  from: one(users, { fields: [mail.fromId], references: [users.id] }),
  to: one(users, { fields: [mail.toId], references: [users.id] }),
}))
export const mapsRelations = relations(beatmaps, ({ one }) => ({
  source: one(sources, { fields: [beatmaps.setId, beatmaps.server], references: [sources.id, sources.server] }),
}))
export const sourcesRelations = relations(sources, ({ many }) => ({
  beatmaps: many(beatmaps),
}))
export const statsRelations = relations(stats, ({ one }) => ({
  user: one(users, { fields: [stats.id], references: [users.id] }),
}))
export const scoresRelations = relations(scores, ({ one }) => ({
  user: one(users, { fields: [scores.userId], references: [users.id] }),
  beatmap: one(beatmaps, { fields: [scores.mapMd5], references: [beatmaps.md5] }),
}))
export const clansRelations = relations(clans, ({ one }) => ({
  owner: one(users, { fields: [clans.ownerId], references: [users.id] }),
}))
export const usersRelations = relations(users, ({ one }) => ({
  clan: one(clans, { fields: [users.clanId], references: [clans.id] }),
}))
export const usersAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, { fields: [userAchievements.userId], references: [users.id] }),
  achievement: one(achievements, { fields: [userAchievements.achievementId], references: [achievements.id] }),
}))
