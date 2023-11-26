import { mysqlTable, mysqlSchema, AnyMySqlColumn, primaryKey, unique, int, varchar, tinyint, datetime, char, index, mysqlEnum, date, text } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"


export const achievements = mysqlTable("achievements", {
	id: int("id").autoincrement().notNull(),
	file: varchar("file", { length: 128 }).notNull(),
	name: varchar("name", { length: 128 }).notNull(),
	desc: varchar("desc", { length: 256 }).notNull(),
	cond: varchar("cond", { length: 64 }).notNull(),
},
(table) => {
	return {
		achievementsIdPk: primaryKey({ columns: [table.id], name: "achievements_id_pk"}),
		achievementsDescUindex: unique("achievements_desc_uindex").on(table.desc),
		achievementsFileUindex: unique("achievements_file_uindex").on(table.file),
		achievementsNameUindex: unique("achievements_name_uindex").on(table.name),
	}
});

export const channels = mysqlTable("channels", {
	id: int("id").autoincrement().notNull(),
	name: varchar("name", { length: 32 }).notNull(),
	topic: varchar("topic", { length: 256 }).notNull(),
	readPriv: int("read_priv").default(1).notNull(),
	writePriv: int("write_priv").default(2).notNull(),
	autoJoin: tinyint("auto_join").default(0).notNull(),
},
(table) => {
	return {
		channelsIdPk: primaryKey({ columns: [table.id], name: "channels_id_pk"}),
		channelsNameUindex: unique("channels_name_uindex").on(table.name),
	}
});

export const clans = mysqlTable("clans", {
	id: int("id").autoincrement().notNull(),
	name: varchar("name", { length: 16 }).notNull(),
	tag: varchar("tag", { length: 6 }).notNull(),
	owner: int("owner").notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).notNull(),
},
(table) => {
	return {
		clansIdPk: primaryKey({ columns: [table.id], name: "clans_id_pk"}),
		clansNameUindex: unique("clans_name_uindex").on(table.name),
		clansOwnerUindex: unique("clans_owner_uindex").on(table.owner),
		clansTagUindex: unique("clans_tag_uindex").on(table.tag),
	}
});

export const clientHashes = mysqlTable("client_hashes", {
	userid: int("userid").notNull(),
	osupath: char("osupath", { length: 32 }).notNull(),
	adapters: char("adapters", { length: 32 }).notNull(),
	uninstallId: char("uninstall_id", { length: 32 }).notNull(),
	diskSerial: char("disk_serial", { length: 32 }).notNull(),
	latestTime: datetime("latest_time", { mode: 'string'}).notNull(),
	occurrences: int("occurrences").default(0).notNull(),
},
(table) => {
	return {
		clientHashesUseridOsupathAdaptersUninstallIdDiskSerialPk: primaryKey({ columns: [table.userid, table.osupath, table.adapters, table.uninstallId, table.diskSerial], name: "client_hashes_userid_osupath_adapters_uninstall_id_disk_serial_pk"}),
	}
});

export const comments = mysqlTable("comments", {
	id: int("id").autoincrement().notNull(),
	targetId: int("target_id").notNull(),
	targetType: mysqlEnum("target_type", ['replay','map','song']).notNull(),
	userid: int("userid").notNull(),
	time: int("time").notNull(),
	comment: varchar("comment", { length: 80 }).notNull(),
	colour: char("colour", { length: 6 }),
},
(table) => {
	return {
		useridFkey: index("comments_userid_fkey").on(table.userid),
		commentsIdPk: primaryKey({ columns: [table.id], name: "comments_id_pk"}),
	}
});

export const favourites = mysqlTable("favourites", {
	userid: int("userid").notNull(),
	setid: int("setid").notNull(),
	createdAt: int("created_at").default(0).notNull(),
},
(table) => {
	return {
		favouritesUseridSetidPk: primaryKey({ columns: [table.userid, table.setid], name: "favourites_userid_setid_pk"}),
	}
});

export const ingameLogins = mysqlTable("ingame_logins", {
	id: int("id").autoincrement().notNull(),
	userid: int("userid").notNull(),
	ip: varchar("ip", { length: 45 }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	osuVer: date("osu_ver", { mode: 'string' }).notNull(),
	osuStream: varchar("osu_stream", { length: 128 }).notNull(),
	datetime: datetime("datetime", { mode: 'string'}).notNull(),
},
(table) => {
	return {
		ingameLoginsIdPk: primaryKey({ columns: [table.id], name: "ingame_logins_id_pk"}),
	}
});

export const logs = mysqlTable("logs", {
	id: int("id").autoincrement().notNull(),
	from: int("from").notNull(),
	to: int("to").notNull(),
	msg: varchar("msg", { length: 2048 }).notNull(),
	time: datetime("time", { mode: 'string'}).notNull(),
},
(table) => {
	return {
		logsIdPk: primaryKey({ columns: [table.id], name: "logs_id_pk"}),
	}
});

export const mail = mysqlTable("mail", {
	id: int("id").autoincrement().notNull(),
	fromId: int("from_id").notNull(),
	toId: int("to_id").notNull(),
	msg: varchar("msg", { length: 2048 }).notNull(),
	time: int("time"),
	read: tinyint("read").default(0).notNull(),
},
(table) => {
	return {
		mailIdPk: primaryKey({ columns: [table.id], name: "mail_id_pk"}),
	}
});

export const mapRequests = mysqlTable("map_requests", {
	id: int("id").autoincrement().notNull(),
	mapId: int("map_id").notNull(),
	playerId: int("player_id").notNull(),
	datetime: datetime("datetime", { mode: 'string'}).notNull(),
	active: tinyint("active").notNull(),
},
(table) => {
	return {
		mapRequestsIdPk: primaryKey({ columns: [table.id], name: "map_requests_id_pk"}),
	}
});

export const maps = mysqlTable("maps", {
	id: int("id").notNull(),
	server: mysqlEnum("server", ['osu!','private']).default('osu!').notNull(),
	setId: int("set_id").notNull(),
	status: int("status").notNull(),
	md5: char("md5", { length: 32 }).notNull(),
	artist: varchar("artist", { length: 128 }).notNull(),
	title: varchar("title", { length: 128 }).notNull(),
	version: varchar("version", { length: 128 }).notNull(),
	creator: varchar("creator", { length: 19 }).notNull(),
	filename: varchar("filename", { length: 256 }).notNull(),
	lastUpdate: datetime("last_update", { mode: 'string'}).notNull(),
	totalLength: int("total_length").notNull(),
	maxCombo: int("max_combo").notNull(),
	frozen: tinyint("frozen").default(0).notNull(),
	plays: int("plays").default(0).notNull(),
	passes: int("passes").default(0).notNull(),
	mode: tinyint("mode").default(0).notNull(),
	// Warning: Can't parse float(12,2) from database
	// float(12,2)Type: float(12,2)("bpm").notNull(),
	// Warning: Can't parse float(4,2) from database
	// float(4,2)Type: float(4,2)("cs").notNull(),
	// Warning: Can't parse float(4,2) from database
	// float(4,2)Type: float(4,2)("ar").notNull(),
	// Warning: Can't parse float(4,2) from database
	// float(4,2)Type: float(4,2)("od").notNull(),
	// Warning: Can't parse float(4,2) from database
	// float(4,2)Type: float(4,2)("hp").notNull(),
	// Warning: Can't parse float(6,3) from database
	// float(6,3)Type: float(6,3)("diff").notNull(),
},
(table) => {
	return {
		filename: index("filename").on(table.filename),
		mapsServerIdPk: primaryKey({ columns: [table.server, table.id], name: "maps_server_id_pk"}),
		mapsIdUindex: unique("maps_id_uindex").on(table.id),
		mapsMd5Uindex: unique("maps_md5_uindex").on(table.md5),
	}
});

export const mapsLack = mysqlTable("maps_lack", {
	md5: varchar("md5", { length: 255 }).notNull(),
	lackType: varchar("lack_type", { length: 255 }).notNull(),
},
(table) => {
	return {
		mapsLackMd5Pk: primaryKey({ columns: [table.md5], name: "maps_lack_md5_pk"}),
	}
});

export const mapsets = mysqlTable("mapsets", {
	server: mysqlEnum("server", ['osu!','private']).default('osu!').notNull(),
	id: int("id").notNull(),
	lastOsuapiCheck: datetime("last_osuapi_check", { mode: 'string'}).default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => {
	return {
		mapsetsServerIdPk: primaryKey({ columns: [table.server, table.id], name: "mapsets_server_id_pk"}),
		nmapsetsIdUindex: unique("nmapsets_id_uindex").on(table.id),
	}
});

export const performanceReports = mysqlTable("performance_reports", {
	scoreid: bigint("scoreid", { mode: "number", unsigned: true }).notNull(),
	modMode: mysqlEnum("mod_mode", ['vanilla','relax','autopilot']).default('vanilla').notNull(),
	os: varchar("os", { length: 64 }).notNull(),
	fullscreen: tinyint("fullscreen").notNull(),
	fpsCap: varchar("fps_cap", { length: 16 }).notNull(),
	compatibility: tinyint("compatibility").notNull(),
	version: varchar("version", { length: 16 }).notNull(),
	startTime: int("start_time").notNull(),
	endTime: int("end_time").notNull(),
	frameCount: int("frame_count").notNull(),
	spikeFrames: int("spike_frames").notNull(),
	aimRate: int("aim_rate").notNull(),
	completion: tinyint("completion").notNull(),
	identifier: varchar("identifier", { length: 128 }),
	averageFrametime: int("average_frametime").notNull(),
},
(table) => {
	return {
		performanceReportsScoreidModModePk: primaryKey({ columns: [table.scoreid, table.modMode], name: "performance_reports_scoreid_mod_mode_pk"}),
	}
});

export const ratings = mysqlTable("ratings", {
	userid: int("userid").notNull(),
	mapMd5: char("map_md5", { length: 32 }).notNull(),
	rating: tinyint("rating").notNull(),
},
(table) => {
	return {
		ratingsUseridMapMd5Pk: primaryKey({ columns: [table.userid, table.mapMd5], name: "ratings_userid_map_md5_pk"}),
	}
});

export const relationships = mysqlTable("relationships", {
	user1: int("user1").notNull(),
	user2: int("user2").notNull(),
	type: mysqlEnum("type", ['friend','block']).notNull(),
},
(table) => {
	return {
		relationshipsUser1User2Pk: primaryKey({ columns: [table.user1, table.user2], name: "relationships_user1_user2_pk"}),
	}
});

export const scores = mysqlTable("scores", {
	id: bigint("id", { mode: "number", unsigned: true }).autoincrement().notNull(),
	mapMd5: char("map_md5", { length: 32 }).notNull(),
	score: int("score").notNull(),
	// Warning: Can't parse float(7,3) from database
	// float(7,3)Type: float(7,3)("pp").notNull(),
	// Warning: Can't parse float(6,3) from database
	// float(6,3)Type: float(6,3)("acc").notNull(),
	maxCombo: int("max_combo").notNull(),
	mods: int("mods").notNull(),
	n300: int("n300").notNull(),
	n100: int("n100").notNull(),
	n50: int("n50").notNull(),
	nmiss: int("nmiss").notNull(),
	ngeki: int("ngeki").notNull(),
	nkatu: int("nkatu").notNull(),
	grade: varchar("grade", { length: 2 }).default('N').notNull(),
	status: tinyint("status").notNull(),
	mode: tinyint("mode").notNull(),
	playTime: datetime("play_time", { mode: 'string'}).notNull(),
	timeElapsed: int("time_elapsed").notNull(),
	clientFlags: int("client_flags").notNull(),
	userid: int("userid").notNull(),
	perfect: tinyint("perfect").notNull(),
	onlineChecksum: char("online_checksum", { length: 32 }).notNull(),
},
(table) => {
	return {
		mapMd5: index("map_md5").on(table.mapMd5),
		userid: index("userid").on(table.userid),
		scoresIdPk: primaryKey({ columns: [table.id], name: "scores_id_pk"}),
	}
});

export const startups = mysqlTable("startups", {
	id: int("id").autoincrement().notNull(),
	verMajor: tinyint("ver_major").notNull(),
	verMinor: tinyint("ver_minor").notNull(),
	verMicro: tinyint("ver_micro").notNull(),
	datetime: datetime("datetime", { mode: 'string'}).notNull(),
},
(table) => {
	return {
		startupsIdPk: primaryKey({ columns: [table.id], name: "startups_id_pk"}),
	}
});

export const stats = mysqlTable("stats", {
	id: int("id").notNull(),
	mode: tinyint("mode").notNull(),
	tscore: bigint("tscore", { mode: "number", unsigned: true }).notNull(),
	rscore: bigint("rscore", { mode: "number", unsigned: true }).notNull(),
	pp: int("pp", { unsigned: true }).default(0).notNull(),
	plays: int("plays", { unsigned: true }).default(0).notNull(),
	playtime: int("playtime", { unsigned: true }).default(0).notNull(),
	// Warning: Can't parse float(6,3) from database
	// float(6,3)Type: float(6,3)("acc").notNull(),
	maxCombo: int("max_combo", { unsigned: true }).default(0).notNull(),
	totalHits: int("total_hits", { unsigned: true }).default(0).notNull(),
	replayViews: int("replay_views", { unsigned: true }).default(0).notNull(),
	xhCount: int("xh_count", { unsigned: true }).default(0).notNull(),
	xCount: int("x_count", { unsigned: true }).default(0).notNull(),
	shCount: int("sh_count", { unsigned: true }).default(0).notNull(),
	sCount: int("s_count", { unsigned: true }).default(0).notNull(),
	aCount: int("a_count", { unsigned: true }).default(0).notNull(),
},
(table) => {
	return {
		statsIdModePk: primaryKey({ columns: [table.id, table.mode], name: "stats_id_mode_pk"}),
	}
});

export const tourneyPoolMaps = mysqlTable("tourney_pool_maps", {
	mapId: int("map_id").notNull(),
	poolId: int("pool_id").notNull(),
	mods: int("mods").notNull(),
	slot: tinyint("slot").notNull(),
},
(table) => {
	return {
		tourneyPoolsIdFk: index("tourney_pool_maps_tourney_pools_id_fk").on(table.poolId),
		tourneyPoolMapsMapIdPoolIdPk: primaryKey({ columns: [table.mapId, table.poolId], name: "tourney_pool_maps_map_id_pool_id_pk"}),
	}
});

export const tourneyPools = mysqlTable("tourney_pools", {
	id: int("id").autoincrement().notNull(),
	name: varchar("name", { length: 16 }).notNull(),
	createdAt: datetime("created_at", { mode: 'string'}).notNull(),
	createdBy: int("created_by").notNull(),
},
(table) => {
	return {
		usersIdFk: index("tourney_pools_users_id_fk").on(table.createdBy),
		tourneyPoolsIdPk: primaryKey({ columns: [table.id], name: "tourney_pools_id_pk"}),
	}
});

export const userAchievements = mysqlTable("user_achievements", {
	userid: int("userid").notNull(),
	achid: int("achid").notNull(),
},
(table) => {
	return {
		userAchievementsUseridAchidPk: primaryKey({ columns: [table.userid, table.achid], name: "user_achievements_userid_achid_pk"}),
	}
});

export const userpages = mysqlTable("userpages", {
	id: int("id").autoincrement().notNull(),
	userId: int("user_id").notNull(),
	html: text("html"),
	raw: text("raw"),
	rawType: mysqlEnum("raw_type", ['tiptap']),
},
(table) => {
	return {
		userId: index("user_id").on(table.userId),
		userpagesIdPk: primaryKey({ columns: [table.id], name: "userpages_id_pk"}),
	}
});

export const users = mysqlTable("users", {
	id: int("id").autoincrement().notNull(),
	name: varchar("name", { length: 32 }).notNull(),
	safeName: varchar("safe_name", { length: 32 }).notNull(),
	email: varchar("email", { length: 254 }).notNull(),
	priv: int("priv").default(1).notNull(),
	pwBcrypt: char("pw_bcrypt", { length: 60 }).notNull(),
	country: char("country", { length: 2 }).default('xx').notNull(),
	silenceEnd: int("silence_end").default(0).notNull(),
	donorEnd: int("donor_end").default(0).notNull(),
	creationTime: int("creation_time").default(0).notNull(),
	latestActivity: int("latest_activity").default(0).notNull(),
	preferredMode: int("preferred_mode").default(0).notNull(),
	playStyle: int("play_style").default(0).notNull(),
	customBadgeName: varchar("custom_badge_name", { length: 16 }),
	customBadgeIcon: varchar("custom_badge_icon", { length: 64 }),
	userpageContent: varchar("userpage_content", { length: 2048 }),
	clanId: int("clan_id").default(0).notNull(),
	clanPriv: tinyint("clan_priv").default(0).notNull(),
	apiKey: char("api_key", { length: 36 }),
},
(table) => {
	return {
		clanIdFkey: index("users_clan_id_fkey").on(table.clanId),
		usersIdPk: primaryKey({ columns: [table.id], name: "users_id_pk"}),
		usersApiKeyUindex: unique("users_api_key_uindex").on(table.apiKey),
		usersEmailUindex: unique("users_email_uindex").on(table.email),
		usersNameUindex: unique("users_name_uindex").on(table.name),
		usersSafeNameUindex: unique("users_safe_name_uindex").on(table.safeName),
	}
});