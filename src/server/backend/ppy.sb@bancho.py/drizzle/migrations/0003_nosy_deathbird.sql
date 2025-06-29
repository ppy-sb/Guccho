DROP INDEX `map_md5` ON `scores`;--> statement-breakpoint
DROP INDEX `userid` ON `scores`;--> statement-breakpoint
DROP INDEX `md5-mode-status` ON `scores`;--> statement-breakpoint
CREATE INDEX `map-leaderboard` ON `scores` (`map_md5`,`mode`,`status`);--> statement-breakpoint
CREATE INDEX `user-best` ON `scores` (`userid`,`mode`,`status`,`pp`);--> statement-breakpoint
CREATE INDEX `scores_checksum` ON `scores` (`online_checksum`);