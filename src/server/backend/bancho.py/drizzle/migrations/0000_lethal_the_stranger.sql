-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`file` varchar(128) NOT NULL,
	`name` varchar(128) NOT NULL,
	`desc` varchar(256) NOT NULL,
	`cond` varchar(64) NOT NULL,
	CONSTRAINT `achievements_id_pk` PRIMARY KEY(`id`),
	CONSTRAINT `achievements_desc_uindex` UNIQUE(`desc`),
	CONSTRAINT `achievements_file_uindex` UNIQUE(`file`),
	CONSTRAINT `achievements_name_uindex` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `channels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(32) NOT NULL,
	`topic` varchar(256) NOT NULL,
	`read_priv` int NOT NULL DEFAULT 1,
	`write_priv` int NOT NULL DEFAULT 2,
	`auto_join` tinyint NOT NULL DEFAULT 0,
	CONSTRAINT `channels_id_pk` PRIMARY KEY(`id`),
	CONSTRAINT `channels_name_uindex` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `clans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(16) NOT NULL,
	`tag` varchar(6) NOT NULL,
	`owner` int NOT NULL,
	`created_at` datetime NOT NULL,
	CONSTRAINT `clans_id_pk` PRIMARY KEY(`id`),
	CONSTRAINT `clans_name_uindex` UNIQUE(`name`),
	CONSTRAINT `clans_owner_uindex` UNIQUE(`owner`),
	CONSTRAINT `clans_tag_uindex` UNIQUE(`tag`)
);
--> statement-breakpoint
CREATE TABLE `client_hashes` (
	`userid` int NOT NULL,
	`osupath` char(32) NOT NULL,
	`adapters` char(32) NOT NULL,
	`uninstall_id` char(32) NOT NULL,
	`disk_serial` char(32) NOT NULL,
	`latest_time` datetime NOT NULL,
	`occurrences` int NOT NULL DEFAULT 0,
	CONSTRAINT `client_hashes_userid_osupath_adapters_uninstall_id_disk_serial_pk` PRIMARY KEY(`userid`,`osupath`,`adapters`,`uninstall_id`,`disk_serial`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`target_id` int NOT NULL,
	`target_type` enum('replay','map','song') NOT NULL,
	`userid` int NOT NULL,
	`time` int NOT NULL,
	`comment` varchar(80) NOT NULL,
	`colour` char(6),
	CONSTRAINT `comments_id_pk` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favourites` (
	`userid` int NOT NULL,
	`setid` int NOT NULL,
	`created_at` int NOT NULL DEFAULT 0,
	CONSTRAINT `favourites_userid_setid_pk` PRIMARY KEY(`userid`,`setid`)
);
--> statement-breakpoint
CREATE TABLE `ingame_logins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userid` int NOT NULL,
	`ip` varchar(45) NOT NULL,
	`osu_ver` date NOT NULL,
	`osu_stream` varchar(128) NOT NULL,
	`datetime` datetime NOT NULL,
	CONSTRAINT `ingame_logins_id_pk` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`from` int NOT NULL,
	`to` int NOT NULL,
	`msg` varchar(2048) NOT NULL,
	`time` datetime NOT NULL,
	CONSTRAINT `logs_id_pk` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mail` (
	`id` int AUTO_INCREMENT NOT NULL,
	`from_id` int NOT NULL,
	`to_id` int NOT NULL,
	`msg` varchar(2048) NOT NULL,
	`time` int,
	`read` tinyint NOT NULL DEFAULT 0,
	CONSTRAINT `mail_id_pk` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `map_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`map_id` int NOT NULL,
	`player_id` int NOT NULL,
	`datetime` datetime NOT NULL,
	`active` tinyint NOT NULL,
	CONSTRAINT `map_requests_id_pk` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maps` (
	`id` int NOT NULL,
	`server` enum('osu!','private') NOT NULL DEFAULT 'osu!',
	`set_id` int NOT NULL,
	`status` int NOT NULL,
	`md5` char(32) NOT NULL,
	`artist` varchar(128) NOT NULL,
	`title` varchar(128) NOT NULL,
	`version` varchar(128) NOT NULL,
	`creator` varchar(19) NOT NULL,
	`filename` varchar(256) NOT NULL,
	`last_update` datetime NOT NULL,
	`total_length` int NOT NULL,
	`max_combo` int NOT NULL,
	`frozen` tinyint NOT NULL DEFAULT 0,
	`plays` int NOT NULL DEFAULT 0,
	`passes` int NOT NULL DEFAULT 0,
	`mode` tinyint NOT NULL DEFAULT 0,
	`bpm` float(12,2) NOT NULL DEFAULT 0,
	`cs` float(4,2) NOT NULL DEFAULT 0,
	`ar` float(4,2) NOT NULL DEFAULT 0,
	`od` float(4,2) NOT NULL DEFAULT 0,
	`hp` float(4,2) NOT NULL DEFAULT 0,
	`diff` float(6,3) NOT NULL DEFAULT 0,
	CONSTRAINT `maps_server_id_pk` PRIMARY KEY(`server`,`id`),
	CONSTRAINT `maps_id_uindex` UNIQUE(`id`),
	CONSTRAINT `maps_md5_uindex` UNIQUE(`md5`)
);
--> statement-breakpoint
CREATE TABLE `maps_lack` (
	`md5` varchar(255) NOT NULL,
	`lack_type` varchar(255) NOT NULL,
	CONSTRAINT `maps_lack_md5_pk` PRIMARY KEY(`md5`)
);
--> statement-breakpoint
CREATE TABLE `mapsets` (
	`server` enum('osu!','private') NOT NULL DEFAULT 'osu!',
	`id` int NOT NULL,
	`last_osuapi_check` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `mapsets_server_id_pk` PRIMARY KEY(`server`,`id`),
	CONSTRAINT `nmapsets_id_uindex` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_reports` (
	`scoreid` bigint unsigned NOT NULL,
	`mod_mode` enum('vanilla','relax','autopilot') NOT NULL DEFAULT 'vanilla',
	`os` varchar(64) NOT NULL,
	`fullscreen` tinyint NOT NULL,
	`fps_cap` varchar(16) NOT NULL,
	`compatibility` tinyint NOT NULL,
	`version` varchar(16) NOT NULL,
	`start_time` int NOT NULL,
	`end_time` int NOT NULL,
	`frame_count` int NOT NULL,
	`spike_frames` int NOT NULL,
	`aim_rate` int NOT NULL,
	`completion` tinyint NOT NULL,
	`identifier` varchar(128),
	`average_frametime` int NOT NULL,
	CONSTRAINT `performance_reports_scoreid_mod_mode_pk` PRIMARY KEY(`scoreid`,`mod_mode`)
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`userid` int NOT NULL,
	`map_md5` char(32) NOT NULL,
	`rating` tinyint NOT NULL,
	CONSTRAINT `ratings_userid_map_md5_pk` PRIMARY KEY(`userid`,`map_md5`)
);
--> statement-breakpoint
CREATE TABLE `relationships` (
	`user1` int NOT NULL,
	`user2` int NOT NULL,
	`type` enum('friend','block') NOT NULL,
	CONSTRAINT `relationships_user1_user2_pk` PRIMARY KEY(`user1`,`user2`)
);
--> statement-breakpoint
CREATE TABLE `scores` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`map_md5` char(32) NOT NULL,
	`score` int NOT NULL,
	`pp` float(7,3) NOT NULL,
	`acc` float(6,3) NOT NULL,
	`max_combo` int NOT NULL,
	`mods` int NOT NULL,
	`n300` int NOT NULL,
	`n100` int NOT NULL,
	`n50` int NOT NULL,
	`nmiss` int NOT NULL,
	`ngeki` int NOT NULL,
	`nkatu` int NOT NULL,
	`grade` varchar(2) NOT NULL DEFAULT 'N',
	`status` tinyint NOT NULL,
	`mode` tinyint NOT NULL,
	`play_time` datetime NOT NULL,
	`time_elapsed` int NOT NULL,
	`client_flags` int NOT NULL,
	`userid` int NOT NULL,
	`perfect` tinyint NOT NULL,
	`online_checksum` char(32) NOT NULL,
	CONSTRAINT `scores_id_pk` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `startups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ver_major` tinyint NOT NULL,
	`ver_minor` tinyint NOT NULL,
	`ver_micro` tinyint NOT NULL,
	`datetime` datetime NOT NULL,
	CONSTRAINT `startups_id_pk` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stats` (
	`id` int NOT NULL,
	`mode` tinyint NOT NULL,
	`tscore` bigint unsigned NOT NULL DEFAULT 0,
	`rscore` bigint unsigned NOT NULL DEFAULT 0,
	`pp` int unsigned NOT NULL DEFAULT 0,
	`plays` int unsigned NOT NULL DEFAULT 0,
	`playtime` int unsigned NOT NULL DEFAULT 0,
	`acc` float(6,3) NOT NULL DEFAULT 0,
	`max_combo` int unsigned NOT NULL DEFAULT 0,
	`total_hits` int unsigned NOT NULL DEFAULT 0,
	`replay_views` int unsigned NOT NULL DEFAULT 0,
	`xh_count` int unsigned NOT NULL DEFAULT 0,
	`x_count` int unsigned NOT NULL DEFAULT 0,
	`sh_count` int unsigned NOT NULL DEFAULT 0,
	`s_count` int unsigned NOT NULL DEFAULT 0,
	`a_count` int unsigned NOT NULL DEFAULT 0,
	CONSTRAINT `stats_id_mode_pk` PRIMARY KEY(`id`,`mode`)
);
--> statement-breakpoint
CREATE TABLE `tourney_pool_maps` (
	`map_id` int NOT NULL,
	`pool_id` int NOT NULL,
	`mods` int NOT NULL,
	`slot` tinyint NOT NULL,
	CONSTRAINT `tourney_pool_maps_map_id_pool_id_pk` PRIMARY KEY(`map_id`,`pool_id`)
);
--> statement-breakpoint
CREATE TABLE `tourney_pools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(16) NOT NULL,
	`created_at` datetime NOT NULL,
	`created_by` int NOT NULL,
	CONSTRAINT `tourney_pools_id_pk` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_achievements` (
	`userid` int NOT NULL,
	`achid` int NOT NULL,
	CONSTRAINT `user_achievements_userid_achid_pk` PRIMARY KEY(`userid`,`achid`)
);
--> statement-breakpoint
CREATE TABLE `userpages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`html` text,
	`raw` text,
	`raw_type` enum('tiptap'),
	CONSTRAINT `userpages_id_pk` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(32) NOT NULL,
	`safe_name` varchar(32) NOT NULL,
	`email` varchar(254) NOT NULL,
	`priv` int NOT NULL DEFAULT 1,
	`pw_bcrypt` char(60) NOT NULL,
	`country` char(2) NOT NULL DEFAULT 'xx',
	`silence_end` int NOT NULL DEFAULT 0,
	`donor_end` int NOT NULL DEFAULT 0,
	`creation_time` int NOT NULL DEFAULT 0,
	`latest_activity` int NOT NULL DEFAULT 0,
	`preferred_mode` int NOT NULL DEFAULT 0,
	`play_style` int NOT NULL DEFAULT 0,
	`custom_badge_name` varchar(16),
	`custom_badge_icon` varchar(64),
	`userpage_content` varchar(2048),
	`clan_id` int NOT NULL DEFAULT 0,
	`clan_priv` tinyint NOT NULL DEFAULT 0,
	`api_key` char(36),
	CONSTRAINT `users_id_pk` PRIMARY KEY(`id`),
	CONSTRAINT `users_api_key_uindex` UNIQUE(`api_key`),
	CONSTRAINT `users_email_uindex` UNIQUE(`email`),
	CONSTRAINT `users_name_uindex` UNIQUE(`name`),
	CONSTRAINT `users_safe_name_uindex` UNIQUE(`safe_name`)
);
--> statement-breakpoint
CREATE INDEX `comments_userid_fkey` ON `comments` (`userid`);--> statement-breakpoint
CREATE INDEX `filename` ON `maps` (`filename`);--> statement-breakpoint
CREATE INDEX `map_md5` ON `scores` (`map_md5`);--> statement-breakpoint
CREATE INDEX `userid` ON `scores` (`userid`);--> statement-breakpoint
CREATE INDEX `tourney_pool_maps_tourney_pools_id_fk` ON `tourney_pool_maps` (`pool_id`);--> statement-breakpoint
CREATE INDEX `tourney_pools_users_id_fk` ON `tourney_pools` (`created_by`);--> statement-breakpoint
CREATE INDEX `user_id` ON `userpages` (`user_id`);--> statement-breakpoint
CREATE INDEX `users_clan_id_fkey` ON `users` (`clan_id`);
*/