import {
	boolean,
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});

export const links = pgTable("links", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	url: text("url").notNull(),
	isVisible: boolean("is_visible").default(true).notNull(),
	order: integer("order").default(0).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const profile = pgTable("profile", {
	id: serial("id").primaryKey(),
	userId: text("user_id").references(() => user.id),
	displayName: text("display_name").notNull(),
	username: text("username").unique().notNull(),
	bio: text("bio"),
	avatarUrl: text("avatar_url"),
	socialLinks: jsonb("social_links").$type<Record<string, string>>(),
	theme: jsonb("theme").$type<{
		background: string;
		buttonStyle: string;
		font: string;
	}>(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
