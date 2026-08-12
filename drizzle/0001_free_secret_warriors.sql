CREATE TABLE `collaboration_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collaborationId` int NOT NULL,
	`layerId` int,
	`userId` int NOT NULL,
	`text` longtext NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collaboration_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collaboration_contributors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collaborationId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','contributor','viewer') DEFAULT 'contributor',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `collaboration_contributors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collaboration_invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collaborationId` int NOT NULL,
	`invitedUserId` int NOT NULL,
	`invitedByUserId` int NOT NULL,
	`status` enum('pending','accepted','declined','expired') DEFAULT 'pending',
	`message` text,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`respondedAt` timestamp,
	CONSTRAINT `collaboration_invitations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collaboration_layers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collaborationId` int NOT NULL,
	`trackId` int NOT NULL,
	`addedById` int NOT NULL,
	`volume` decimal(3,2) DEFAULT '1.00',
	`pan` decimal(3,2) DEFAULT '0.00',
	`startTime` int DEFAULT 0,
	`endTime` int,
	`fadeIn` int DEFAULT 0,
	`fadeOut` int DEFAULT 0,
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collaboration_layers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collaborations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` longtext,
	`visibility` enum('public','private','invited') DEFAULT 'private',
	`status` enum('draft','in_progress','completed','published') DEFAULT 'draft',
	`likes` int DEFAULT 0,
	`comments` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collaborations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `genres` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`color` varchar(7),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `genres_id` PRIMARY KEY(`id`),
	CONSTRAINT `genres_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `instruments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `instruments_id` PRIMARY KEY(`id`),
	CONSTRAINT `instruments_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipientId` int NOT NULL,
	`type` enum('collab_invite','collab_accepted','track_comment','track_like','playlist_like','new_follower','collab_new_layer','collab_comment') NOT NULL,
	`relatedUserId` int,
	`relatedTrackId` int,
	`relatedCollabId` int,
	`relatedPlaylistId` int,
	`title` varchar(255) NOT NULL,
	`message` longtext,
	`isRead` boolean DEFAULT false,
	`actionUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playlist_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`playlistId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `playlist_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playlist_tracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playlistId` int NOT NULL,
	`trackId` int NOT NULL,
	`order` int DEFAULT 0,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `playlist_tracks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` longtext,
	`coverArtUrl` varchar(1024),
	`visibility` enum('public','private') DEFAULT 'private',
	`trackCount` int DEFAULT 0,
	`likes` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playlists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `track_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackId` int NOT NULL,
	`userId` int NOT NULL,
	`text` longtext NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `track_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `track_downloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`trackId` int NOT NULL,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `track_downloads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `track_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`trackId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `track_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` longtext,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` varchar(1024) NOT NULL,
	`coverArtKey` varchar(512),
	`coverArtUrl` varchar(1024),
	`duration` int,
	`genreId` int,
	`instrumentId` int,
	`bpm` int,
	`key` varchar(10),
	`scale` varchar(50),
	`mood` varchar(100),
	`tags` json,
	`license` enum('cc0','cc-by','cc-by-sa','cc-by-nd','cc-by-nc','cc-by-nc-sa','cc-by-nc-nd','all-rights-reserved') DEFAULT 'all-rights-reserved',
	`visibility` enum('public','private','unlisted') DEFAULT 'public',
	`plays` int DEFAULT 0,
	`downloads` int DEFAULT 0,
	`likes` int DEFAULT 0,
	`comments` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tracks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_follows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`followerId` int NOT NULL,
	`followingId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_follows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_genres` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`genreId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_genres_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_instruments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`instrumentId` int NOT NULL,
	`proficiency` enum('beginner','intermediate','advanced') DEFAULT 'intermediate',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_instruments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`avatar` varchar(512),
	`bio` text,
	`website` varchar(512),
	`twitter` varchar(255),
	`instagram` varchar(255),
	`soundcloud` varchar(255),
	`experienceLevel` enum('beginner','intermediate','advanced','professional') DEFAULT 'beginner',
	`location` varchar(255),
	`followerCount` int DEFAULT 0,
	`followingCount` int DEFAULT 0,
	`trackCount` int DEFAULT 0,
	`collaborationCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `collab_idx` ON `collaboration_comments` (`collaborationId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `collaboration_comments` (`userId`);--> statement-breakpoint
CREATE INDEX `collab_idx` ON `collaboration_contributors` (`collaborationId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `collaboration_contributors` (`userId`);--> statement-breakpoint
CREATE INDEX `collab_idx` ON `collaboration_invitations` (`collaborationId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `collaboration_invitations` (`invitedUserId`);--> statement-breakpoint
CREATE INDEX `collab_idx` ON `collaboration_layers` (`collaborationId`);--> statement-breakpoint
CREATE INDEX `track_idx` ON `collaboration_layers` (`trackId`);--> statement-breakpoint
CREATE INDEX `creator_idx` ON `collaborations` (`creatorId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `collaborations` (`createdAt`);--> statement-breakpoint
CREATE INDEX `recipient_idx` ON `notifications` (`recipientId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `notifications` (`createdAt`);--> statement-breakpoint
CREATE INDEX `user_playlist_idx` ON `playlist_likes` (`userId`,`playlistId`);--> statement-breakpoint
CREATE INDEX `playlist_idx` ON `playlist_tracks` (`playlistId`);--> statement-breakpoint
CREATE INDEX `track_idx` ON `playlist_tracks` (`trackId`);--> statement-breakpoint
CREATE INDEX `creator_idx` ON `playlists` (`creatorId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `playlists` (`createdAt`);--> statement-breakpoint
CREATE INDEX `track_idx` ON `track_comments` (`trackId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `track_comments` (`userId`);--> statement-breakpoint
CREATE INDEX `track_idx` ON `track_downloads` (`trackId`);--> statement-breakpoint
CREATE INDEX `user_track_idx` ON `track_likes` (`userId`,`trackId`);--> statement-breakpoint
CREATE INDEX `creator_idx` ON `tracks` (`creatorId`);--> statement-breakpoint
CREATE INDEX `genre_idx` ON `tracks` (`genreId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `tracks` (`createdAt`);--> statement-breakpoint
CREATE INDEX `follower_idx` ON `user_follows` (`followerId`);--> statement-breakpoint
CREATE INDEX `following_idx` ON `user_follows` (`followingId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `user_genres` (`userId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `user_instruments` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `user_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `openId_idx` ON `users` (`openId`);