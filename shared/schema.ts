import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // "admin", "user"
  newsroomId: integer("newsroom_id"), // null for super admins
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const newsrooms = pgTable("newsrooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  website: text("website"),
  logo: text("logo"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brandStylesheets = pgTable("brand_stylesheets", {
  id: serial("id").primaryKey(),
  newsroomId: integer("newsroom_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  tone: text("tone").notNull(),
  voice: text("voice").notNull(),
  keyMessages: text("key_messages").array(),
  colorPalette: jsonb("color_palette"),
  typography: jsonb("typography"),
  guidelines: text("guidelines"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  newsroomId: integer("newsroom_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(), // email, social, web
  objective: text("objective").notNull(), // subscription, donation, membership, engagement
  context: text("context"),
  aiModel: text("ai_model").notNull(),
  brandStylesheetId: integer("brand_stylesheet_id"),
  status: text("status").notNull().default("draft"), // draft, active, completed, archived
  content: jsonb("content"),
  metrics: jsonb("metrics"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const campaignTemplates = pgTable("campaign_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  icon: text("icon").notNull(),
  setupTime: text("setup_time").notNull(),
  template: jsonb("template").notNull(),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNewsroomSchema = createInsertSchema(newsrooms).omit({
  id: true,
  createdAt: true,
});

export const insertBrandStylesheetSchema = createInsertSchema(brandStylesheets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignTemplateSchema = createInsertSchema(campaignTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertNewsroom = z.infer<typeof insertNewsroomSchema>;
export type InsertBrandStylesheet = z.infer<typeof insertBrandStylesheetSchema>;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type InsertCampaignTemplate = z.infer<typeof insertCampaignTemplateSchema>;

export type User = typeof users.$inferSelect;
export type Newsroom = typeof newsrooms.$inferSelect;
export type BrandStylesheet = typeof brandStylesheets.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type CampaignTemplate = typeof campaignTemplates.$inferSelect;
