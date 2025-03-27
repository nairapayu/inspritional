import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

// Categories schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
});

// Quotes schema
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  author: text("author").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  backgroundUrl: text("background_url"),
  isAiGenerated: boolean("is_ai_generated").default(false),
});

export const insertQuoteSchema = createInsertSchema(quotes).pick({
  text: true,
  author: true,
  categoryId: true,
  backgroundUrl: true,
  isAiGenerated: true,
});

// Favorites schema
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  quoteId: integer("quote_id").references(() => quotes.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).pick({
  userId: true,
  quoteId: true,
});

// Settings schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).unique(),
  theme: text("theme").default("light"),
  font: text("font").default("playfair"),
  language: text("language").default("en"),
  textToSpeech: boolean("text_to_speech").default(false),
  enableNotifications: boolean("enable_notifications").default(true),
  selectedCategories: text("selected_categories").array(),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  theme: true,
  font: true,
  language: true,
  textToSpeech: true,
  enableNotifications: true,
  selectedCategories: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

// Extended schemas for frontend use
export const quoteWithCategory = z.object({
  id: z.number(),
  text: z.string(),
  author: z.string(),
  categoryId: z.number().nullable(),
  categoryName: z.string().nullable(),
  backgroundUrl: z.string().nullable(),
  isAiGenerated: z.boolean().default(false),
  isFavorite: z.boolean().default(false),
});

export type QuoteWithCategory = z.infer<typeof quoteWithCategory>;
