CREATE TABLE `catalog` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contact` (
	`id` text PRIMARY KEY NOT NULL,
	`icon` text NOT NULL,
	`text` text NOT NULL,
	`url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cost` (
	`id` text PRIMARY KEY NOT NULL,
	`value` real NOT NULL,
	`reason` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `expense` (
	`id` text PRIMARY KEY NOT NULL,
	`value` real NOT NULL,
	`reason` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `img` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`product_id` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `order` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`client_name` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`revenue_id` text,
	FOREIGN KEY (`revenue_id`) REFERENCES `revenue`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `product_catalog` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`catalog_id` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`catalog_id`) REFERENCES `catalog`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `revenue` (
	`id` text PRIMARY KEY NOT NULL,
	`value` real NOT NULL,
	`reason` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`age` integer,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`admin` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE TABLE `user_token` (
	`id` text PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
