CREATE TABLE `boxes` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `uploaded_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`box_id` text NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text NOT NULL,
	`byte_size` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`box_id`) REFERENCES `boxes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uploaded_assets_object_key_unique` ON `uploaded_assets` (`object_key`);--> statement-breakpoint
CREATE INDEX `idx_uploaded_assets_box_id` ON `uploaded_assets` (`box_id`);