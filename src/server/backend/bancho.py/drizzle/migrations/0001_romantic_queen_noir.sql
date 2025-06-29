CREATE TABLE `email_tokens` (
	`email` varchar(100) NOT NULL,
	`otp` char(6) NOT NULL,
	`token` varchar(100) NOT NULL,
	`invalid_after` timestamp NOT NULL,
	CONSTRAINT `email_tokens_link` PRIMARY KEY(`token`),
	CONSTRAINT `email_tokens_UN` UNIQUE(`email`,`otp`),
	CONSTRAINT `email_tokens_email_IDX` UNIQUE(`email`,`otp`)
);
--> statement-breakpoint
DROP TABLE `maps_lack`;--> statement-breakpoint
DROP TABLE `userpages`;--> statement-breakpoint
DROP INDEX `users_clan_id_fkey` ON `users`;--> statement-breakpoint
ALTER TABLE `achievements` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `channels` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `clans` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `client_hashes` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `comments` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `favourites` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `ingame_logins` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `logs` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `mail` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `map_requests` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `maps` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `mapsets` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `performance_reports` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `ratings` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `scores` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `startups` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `stats` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `tourney_pool_maps` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `tourney_pools` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `user_achievements` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `users` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `channels` MODIFY COLUMN `auto_join` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `channels` MODIFY COLUMN `auto_join` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `ingame_logins` MODIFY COLUMN `osu_stream` varchar(11) NOT NULL;--> statement-breakpoint
ALTER TABLE `logs` MODIFY COLUMN `msg` varchar(2048);--> statement-breakpoint
ALTER TABLE `mail` MODIFY COLUMN `read` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `mail` MODIFY COLUMN `read` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `map_requests` MODIFY COLUMN `active` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `maps` MODIFY COLUMN `frozen` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `maps` MODIFY COLUMN `frozen` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `performance_reports` MODIFY COLUMN `fullscreen` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `performance_reports` MODIFY COLUMN `compatibility` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `performance_reports` MODIFY COLUMN `completion` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `scores` MODIFY COLUMN `perfect` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `stats` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `achievements` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `channels` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `clans` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `client_hashes` ADD PRIMARY KEY(`userid`,`osupath`,`adapters`,`uninstall_id`,`disk_serial`);--> statement-breakpoint
ALTER TABLE `comments` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `favourites` ADD PRIMARY KEY(`userid`,`setid`);--> statement-breakpoint
ALTER TABLE `ingame_logins` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `logs` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `mail` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `map_requests` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `maps` ADD PRIMARY KEY(`server`,`id`);--> statement-breakpoint
ALTER TABLE `mapsets` ADD PRIMARY KEY(`server`,`id`);--> statement-breakpoint
ALTER TABLE `performance_reports` ADD PRIMARY KEY(`scoreid`,`mod_mode`);--> statement-breakpoint
ALTER TABLE `ratings` ADD PRIMARY KEY(`userid`,`map_md5`);--> statement-breakpoint
ALTER TABLE `scores` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `startups` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `stats` ADD PRIMARY KEY(`id`,`mode`);--> statement-breakpoint
ALTER TABLE `tourney_pool_maps` ADD PRIMARY KEY(`map_id`,`pool_id`);--> statement-breakpoint
ALTER TABLE `tourney_pools` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `user_achievements` ADD PRIMARY KEY(`userid`,`achid`);--> statement-breakpoint
ALTER TABLE `users` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `logs` ADD `action` varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE `map_requests` ADD CONSTRAINT `map_requests_map_id_maps_id_fk` FOREIGN KEY (`map_id`) REFERENCES `maps`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `map_requests` ADD CONSTRAINT `map_requests_player_id_users_id_fk` FOREIGN KEY (`player_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `maps_set_id_server_IDX` ON `maps` (`set_id`,`server`);--> statement-breakpoint
CREATE INDEX `md5-mode-status` ON `scores` (`map_md5`,`mode`,`status`,`userid`);--> statement-breakpoint
CREATE INDEX `users_clan_id_IDX` ON `users` (`clan_id`);