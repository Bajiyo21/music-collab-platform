CREATE TABLE `track_favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trackId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `track_favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `user_track_favorite_idx` ON `track_favorites` (`userId`,`trackId`);