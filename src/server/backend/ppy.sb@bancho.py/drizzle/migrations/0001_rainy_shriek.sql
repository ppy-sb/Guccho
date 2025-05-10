DROP TABLE `username_history`;--> statement-breakpoint
ALTER TABLE `email_tokens` RENAME COLUMN `link` TO `token`;--> statement-breakpoint
ALTER TABLE `scores_suspicion` RENAME COLUMN `suspicion_reason` TO `kind`;--> statement-breakpoint
ALTER TABLE `scores_suspicion` RENAME COLUMN `ignored` TO `is_checked`;--> statement-breakpoint
ALTER TABLE `scores_suspicion` RENAME COLUMN `suspicion_time` TO `created_at`;--> statement-breakpoint
ALTER TABLE `userpages` DROP FOREIGN KEY `fk_user`;
--> statement-breakpoint
ALTER TABLE `relationships` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `channels` MODIFY COLUMN `auto_join` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `channels` MODIFY COLUMN `auto_join` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `logs` MODIFY COLUMN `msg` varchar(2048);--> statement-breakpoint
ALTER TABLE `mail` MODIFY COLUMN `read` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `mail` MODIFY COLUMN `read` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `map_requests` MODIFY COLUMN `active` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `maps` MODIFY COLUMN `frozen` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `maps` MODIFY COLUMN `frozen` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `maps` MODIFY COLUMN `diff` float(6,3) NOT NULL;--> statement-breakpoint
ALTER TABLE `performance_reports` MODIFY COLUMN `fullscreen` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `performance_reports` MODIFY COLUMN `compatibility` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `performance_reports` MODIFY COLUMN `completion` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `scores` MODIFY COLUMN `perfect` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `scores_suspicion` MODIFY COLUMN `kind` enum('hash','replay','report','ppcap') DEFAULT 'replay';--> statement-breakpoint
ALTER TABLE `scores_suspicion` MODIFY COLUMN `is_checked` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `relationships` ADD PRIMARY KEY(`user1`,`user2`);--> statement-breakpoint
ALTER TABLE `logs` ADD `action` varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE `email_tokens` ADD `invalid_after` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `scores_suspicion` ADD `reason` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `userpages` ADD CONSTRAINT `userpages_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `comments_userid_fkey` ON `comments` (`userid`);--> statement-breakpoint
ALTER TABLE `email_tokens` DROP PRIMARY KEY, ADD PRIMARY KEY(`token`);