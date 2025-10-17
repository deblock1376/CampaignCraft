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
  documentPaths: text("document_paths").array().default([]),
  materials: jsonb("materials"),
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
  parentCampaignId: integer("parent_campaign_id"), // For draft variations
  draftNumber: integer("draft_number"), // Which variation (1-5+)
  selectedForMerge: boolean("selected_for_merge").default(false),
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

export const segments = pgTable("segments", {
  id: serial("id").primaryKey(),
  newsroomId: integer("newsroom_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campaignEvaluations = pgTable("campaign_evaluations", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  framework: text("framework").notNull(), // 'bluelena' or 'audience_value_prop'
  overallScore: integer("overall_score").notNull(),
  categoryScores: jsonb("category_scores").notNull(),
  recommendations: jsonb("recommendations").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const storySummaries = pgTable("story_summaries", {
  id: serial("id").primaryKey(),
  newsroomId: integer("newsroom_id").notNull(),
  title: text("title").notNull(),
  originalText: text("original_text"),
  originalUrl: text("original_url"),
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const promptCategories = pgTable("prompt_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  promptKey: text("prompt_key").notNull().unique(),
  promptText: text("prompt_text").notNull(),
  systemMessage: text("system_message"),
  variables: jsonb("variables"),
  aiModel: text("ai_model").notNull().default("gpt-5"),
  status: text("status").notNull().default("active"),
  version: text("version").notNull().default("1.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const promptVersions = pgTable("prompt_versions", {
  id: serial("id").primaryKey(),
  promptId: integer("prompt_id").notNull(),
  version: text("version").notNull(),
  promptText: text("prompt_text").notNull(),
  systemMessage: text("system_message"),
  variables: jsonb("variables"),
  aiModel: text("ai_model").notNull(),
  changeDescription: text("change_description"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clientLogs = pgTable("client_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  newsroomId: integer("newsroom_id"),
  sessionId: text("session_id").notNull(),
  level: text("level").notNull(), // 'error', 'warn', 'info', 'debug'
  message: text("message").notNull(),
  context: jsonb("context"), // Additional data like stack trace, user action, etc.
  url: text("url"), // Page where log occurred
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userFlags = pgTable("user_flags", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  newsroomId: integer("newsroom_id"),
  flagType: text("flag_type").notNull(), // 'good', 'bad', 'testing'
  reason: text("reason"),
  notes: text("notes"),
  flaggedBy: integer("flagged_by").notNull(), // Admin user who flagged
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

export const insertSegmentSchema = createInsertSchema(segments).omit({
  id: true,
  createdAt: true,
});

export const insertCampaignEvaluationSchema = createInsertSchema(campaignEvaluations).omit({
  id: true,
  createdAt: true,
});

export const insertStorySummarySchema = createInsertSchema(storySummaries).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPromptCategorySchema = createInsertSchema(promptCategories).omit({
  id: true,
  createdAt: true,
});

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPromptVersionSchema = createInsertSchema(promptVersions).omit({
  id: true,
  createdAt: true,
});

export const insertClientLogSchema = createInsertSchema(clientLogs).omit({
  id: true,
  createdAt: true,
});

export const insertUserFlagSchema = createInsertSchema(userFlags).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertNewsroom = z.infer<typeof insertNewsroomSchema>;
export type InsertBrandStylesheet = z.infer<typeof insertBrandStylesheetSchema>;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type InsertCampaignTemplate = z.infer<typeof insertCampaignTemplateSchema>;
export type InsertSegment = z.infer<typeof insertSegmentSchema>;
export type InsertCampaignEvaluation = z.infer<typeof insertCampaignEvaluationSchema>;
export type InsertStorySummary = z.infer<typeof insertStorySummarySchema>;
export type InsertPromptCategory = z.infer<typeof insertPromptCategorySchema>;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type InsertPromptVersion = z.infer<typeof insertPromptVersionSchema>;
export type InsertClientLog = z.infer<typeof insertClientLogSchema>;
export type InsertUserFlag = z.infer<typeof insertUserFlagSchema>;

export type User = typeof users.$inferSelect;
export type Newsroom = typeof newsrooms.$inferSelect;
export type BrandStylesheet = typeof brandStylesheets.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type CampaignTemplate = typeof campaignTemplates.$inferSelect;
export type Segment = typeof segments.$inferSelect;
export type CampaignEvaluation = typeof campaignEvaluations.$inferSelect;
export type StorySummary = typeof storySummaries.$inferSelect;
export type PromptCategory = typeof promptCategories.$inferSelect;
export type Prompt = typeof prompts.$inferSelect;
export type PromptVersion = typeof promptVersions.$inferSelect;
export type ClientLog = typeof clientLogs.$inferSelect;
export type UserFlag = typeof userFlags.$inferSelect;
