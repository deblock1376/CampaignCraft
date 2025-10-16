import { 
  users,
  newsrooms, 
  brandStylesheets, 
  campaigns, 
  campaignTemplates,
  segments,
  campaignEvaluations,
  storySummaries,
  promptCategories,
  prompts,
  promptVersions,
  clientLogs,
  userFlags,
  type User,
  type Newsroom,
  type BrandStylesheet,
  type Campaign,
  type CampaignTemplate,
  type Segment,
  type CampaignEvaluation,
  type StorySummary,
  type PromptCategory,
  type Prompt,
  type PromptVersion,
  type ClientLog,
  type UserFlag,
  type InsertUser,
  type InsertNewsroom,
  type InsertBrandStylesheet,
  type InsertCampaign,
  type InsertCampaignTemplate,
  type InsertSegment,
  type InsertCampaignEvaluation,
  type InsertStorySummary,
  type InsertPromptCategory,
  type InsertPrompt,
  type InsertPromptVersion,
  type InsertClientLog,
  type InsertUserFlag
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, lt } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByNewsroomId(newsroomId: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  
  // Newsrooms
  getNewsroom(id: number): Promise<Newsroom | undefined>;
  getNewsroomBySlug(slug: string): Promise<Newsroom | undefined>;
  createNewsroom(newsroom: InsertNewsroom): Promise<Newsroom>;
  getAllNewsrooms(): Promise<Newsroom[]>;
  updateNewsroom(id: number, updates: Partial<InsertNewsroom>): Promise<Newsroom>;
  
  // Brand Stylesheets
  getBrandStylesheet(id: number): Promise<BrandStylesheet | undefined>;
  getBrandStylesheetsByNewsroom(newsroomId: number): Promise<BrandStylesheet[]>;
  getAllBrandStylesheets(): Promise<BrandStylesheet[]>;
  createBrandStylesheet(stylesheet: InsertBrandStylesheet): Promise<BrandStylesheet>;
  updateBrandStylesheet(id: number, stylesheet: Partial<InsertBrandStylesheet>): Promise<BrandStylesheet>;
  deleteBrandStylesheet(id: number): Promise<void>;
  
  // Campaigns
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignsByNewsroom(newsroomId: number): Promise<Campaign[]>;
  getAllCampaigns(): Promise<(Campaign & { newsroomName: string })[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign>;
  deleteCampaign(id: number): Promise<void>;
  
  // Campaign Templates
  getCampaignTemplate(id: number): Promise<CampaignTemplate | undefined>;
  getCampaignTemplates(): Promise<CampaignTemplate[]>;
  createCampaignTemplate(template: InsertCampaignTemplate): Promise<CampaignTemplate>;
  
  // Segments
  getSegment(id: number): Promise<Segment | undefined>;
  getSegmentsByNewsroom(newsroomId: number): Promise<Segment[]>;
  createSegment(segment: InsertSegment): Promise<Segment>;
  updateSegment(id: number, segment: Partial<InsertSegment>): Promise<Segment>;
  deleteSegment(id: number): Promise<void>;
  
  // Campaign Evaluations
  getCampaignEvaluation(id: number): Promise<CampaignEvaluation | undefined>;
  getEvaluationsByCampaign(campaignId: number): Promise<CampaignEvaluation[]>;
  createCampaignEvaluation(evaluation: InsertCampaignEvaluation): Promise<CampaignEvaluation>;
  
  // Story Summaries
  getStorySummary(id: number): Promise<StorySummary | undefined>;
  getStorySummariesByNewsroom(newsroomId: number): Promise<StorySummary[]>;
  createStorySummary(summary: InsertStorySummary): Promise<StorySummary>;
  deleteStorySummary(id: number): Promise<void>;
  
  // Prompt Categories
  getPromptCategory(id: number): Promise<PromptCategory | undefined>;
  getAllPromptCategories(): Promise<PromptCategory[]>;
  createPromptCategory(category: InsertPromptCategory): Promise<PromptCategory>;
  
  // Prompts
  getPrompt(id: number): Promise<Prompt | undefined>;
  getPromptByKey(key: string): Promise<Prompt | undefined>;
  getPromptsByCategory(categoryId: number): Promise<Prompt[]>;
  getAllPrompts(): Promise<Prompt[]>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  updatePrompt(id: number, prompt: Partial<InsertPrompt>): Promise<Prompt>;
  deletePrompt(id: number): Promise<void>;
  
  // Prompt Versions
  getPromptVersions(promptId: number): Promise<PromptVersion[]>;
  createPromptVersion(version: InsertPromptVersion): Promise<PromptVersion>;
  
  // Client Logs
  createClientLogs(logs: InsertClientLog[]): Promise<void>;
  getClientLogs(filters: { userId?: number; newsroomId?: number; level?: string; limit?: number; offset?: number }): Promise<ClientLog[]>;
  deleteOldLogs(daysToKeep: number): Promise<void>;
  
  // User Flags
  createUserFlag(flag: InsertUserFlag): Promise<UserFlag>;
  getUserFlags(userId: number): Promise<UserFlag[]>;
  getAllUserFlags(): Promise<(UserFlag & { userName: string; newsroomName?: string })[]>;
  updateUserFlag(id: number, updates: Partial<InsertUserFlag>): Promise<UserFlag>;
  deleteUserFlag(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private newsrooms: Map<number, Newsroom>;
  private brandStylesheets: Map<number, BrandStylesheet>;
  private campaigns: Map<number, Campaign>;
  private campaignTemplates: Map<number, CampaignTemplate>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.newsrooms = new Map();
    this.brandStylesheets = new Map();
    this.campaigns = new Map();
    this.campaignTemplates = new Map();
    this.currentId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample newsroom
    const sampleNewsroom: Newsroom = {
      id: 1,
      name: "Metro Daily News",
      slug: "metro-daily",
      description: "Local news and investigative journalism",
      website: "https://metrodaily.com",
      logo: null,
      isActive: true,
      createdAt: new Date(),
    };
    this.newsrooms.set(1, sampleNewsroom);

    // Create sample brand stylesheets
    const defaultStylesheet: BrandStylesheet = {
      id: 1,
      newsroomId: 1,
      name: "Metro Daily - Default Style",
      description: "Standard brand voice and messaging",
      tone: "Professional yet approachable",
      voice: "Informative, trustworthy, community-focused",
      keyMessages: [
        "Independent local journalism matters",
        "Community-driven news coverage",
        "Transparency in reporting"
      ],
      colorPalette: {
        primary: "#2563EB",
        secondary: "#64748B",
        accent: "#10B981"
      },
      typography: {
        headlines: "Inter",
        body: "Inter"
      },
      guidelines: "Focus on local impact, use active voice, include community perspectives",
      documentPaths: [],
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.brandStylesheets.set(1, defaultStylesheet);

    // Create sample templates
    const templates: CampaignTemplate[] = [
      {
        id: 1,
        name: "Breaking News Alert",
        description: "Rapid-response template for urgent news coverage with donation CTA",
        type: "email",
        icon: "fas fa-bolt",
        setupTime: "2-3 min setup",
        template: {
          subject: "Breaking: {{headline}}",
          structure: "urgent_news",
          cta: "donation"
        },
        isPublic: true,
        createdAt: new Date(),
      },
      {
        id: 2,
        name: "Monthly Supporter Drive",
        description: "Convert one-time donors to recurring supporters with impact stories",
        type: "email",
        icon: "fas fa-heart",
        setupTime: "5-7 min setup",
        template: {
          subject: "Your support makes a difference",
          structure: "impact_story",
          cta: "monthly_subscription"
        },
        isPublic: true,
        createdAt: new Date(),
      },
      {
        id: 3,
        name: "Social Engagement",
        description: "Multi-platform social campaign to drive website traffic and subscriptions",
        type: "social",
        icon: "fas fa-share-alt",
        setupTime: "3-4 min setup",
        template: {
          platforms: ["twitter", "facebook", "instagram"],
          structure: "engagement_focused",
          cta: "website_visit"
        },
        isPublic: true,
        createdAt: new Date(),
      }
    ];
    
    templates.forEach(template => {
      this.campaignTemplates.set(template.id, template);
    });

    this.currentId = 10;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async getUserByNewsroomId(newsroomId: number): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.newsroomId === newsroomId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role || 'user',
      newsroomId: insertUser.newsroomId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const existing = this.users.get(id);
    if (!existing) {
      throw new Error(`User with id ${id} not found`);
    }
    const updated: User = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return updated;
  }

  // Newsrooms
  async getNewsroom(id: number): Promise<Newsroom | undefined> {
    return this.newsrooms.get(id);
  }

  async getNewsroomBySlug(slug: string): Promise<Newsroom | undefined> {
    return Array.from(this.newsrooms.values()).find(n => n.slug === slug);
  }

  async createNewsroom(insertNewsroom: InsertNewsroom): Promise<Newsroom> {
    const id = this.currentId++;
    const newsroom: Newsroom = {
      ...insertNewsroom,
      id,
      description: insertNewsroom.description || null,
      website: insertNewsroom.website || null,
      logo: insertNewsroom.logo || null,
      isActive: insertNewsroom.isActive ?? true,
      createdAt: new Date(),
    };
    this.newsrooms.set(id, newsroom);
    return newsroom;
  }

  async getAllNewsrooms(): Promise<Newsroom[]> {
    return Array.from(this.newsrooms.values());
  }

  async updateNewsroom(id: number, updates: Partial<InsertNewsroom>): Promise<Newsroom> {
    const existing = this.newsrooms.get(id);
    if (!existing) {
      throw new Error(`Newsroom with id ${id} not found`);
    }
    const updated: Newsroom = {
      ...existing,
      ...updates,
    };
    this.newsrooms.set(id, updated);
    return updated;
  }

  // Brand Stylesheets
  async getBrandStylesheet(id: number): Promise<BrandStylesheet | undefined> {
    return this.brandStylesheets.get(id);
  }

  async getBrandStylesheetsByNewsroom(newsroomId: number): Promise<BrandStylesheet[]> {
    return Array.from(this.brandStylesheets.values()).filter(s => s.newsroomId === newsroomId);
  }

  async getAllBrandStylesheets(): Promise<BrandStylesheet[]> {
    return Array.from(this.brandStylesheets.values());
  }

  async createBrandStylesheet(insertStylesheet: InsertBrandStylesheet): Promise<BrandStylesheet> {
    const id = this.currentId++;
    const stylesheet: BrandStylesheet = {
      ...insertStylesheet,
      id,
      description: insertStylesheet.description || null,
      keyMessages: insertStylesheet.keyMessages || null,
      colorPalette: insertStylesheet.colorPalette || null,
      typography: insertStylesheet.typography || null,
      guidelines: insertStylesheet.guidelines || null,
      documentPaths: insertStylesheet.documentPaths || null,
      isDefault: insertStylesheet.isDefault || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.brandStylesheets.set(id, stylesheet);
    return stylesheet;
  }

  async updateBrandStylesheet(id: number, updates: Partial<InsertBrandStylesheet>): Promise<BrandStylesheet> {
    const existing = this.brandStylesheets.get(id);
    if (!existing) {
      throw new Error(`Brand stylesheet with id ${id} not found`);
    }
    const updated: BrandStylesheet = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.brandStylesheets.set(id, updated);
    return updated;
  }

  async deleteBrandStylesheet(id: number): Promise<void> {
    this.brandStylesheets.delete(id);
  }

  // Campaigns
  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getCampaignsByNewsroom(newsroomId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values())
      .filter(c => c.newsroomId === newsroomId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllCampaigns(): Promise<(Campaign & { newsroomName: string })[]> {
    return Array.from(this.campaigns.values()).map(campaign => {
      const newsroom = this.newsrooms.get(campaign.newsroomId);
      return {
        ...campaign,
        newsroomName: newsroom?.name || 'Unknown Newsroom'
      };
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentId++;
    const campaign: Campaign = {
      ...insertCampaign,
      id,
      status: insertCampaign.status || 'draft',
      context: insertCampaign.context || null,
      brandStylesheetId: insertCampaign.brandStylesheetId || null,
      content: insertCampaign.content || null,
      metrics: insertCampaign.metrics || null,
      parentCampaignId: insertCampaign.parentCampaignId || null,
      draftNumber: insertCampaign.draftNumber || null,
      selectedForMerge: insertCampaign.selectedForMerge || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign> {
    const existing = this.campaigns.get(id);
    if (!existing) {
      throw new Error(`Campaign with id ${id} not found`);
    }
    const updated: Campaign = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.campaigns.set(id, updated);
    return updated;
  }

  async deleteCampaign(id: number): Promise<void> {
    this.campaigns.delete(id);
  }

  // Campaign Templates
  async getCampaignTemplate(id: number): Promise<CampaignTemplate | undefined> {
    return this.campaignTemplates.get(id);
  }

  async getCampaignTemplates(): Promise<CampaignTemplate[]> {
    return Array.from(this.campaignTemplates.values());
  }

  async createCampaignTemplate(insertTemplate: InsertCampaignTemplate): Promise<CampaignTemplate> {
    const id = this.currentId++;
    const template: CampaignTemplate = {
      ...insertTemplate,
      id,
      isPublic: insertTemplate.isPublic || null,
      createdAt: new Date(),
    };
    this.campaignTemplates.set(id, template);
    return template;
  }

  // Segments (stub for MemStorage - not used in production)
  async getSegment(id: number): Promise<Segment | undefined> {
    throw new Error('MemStorage not implemented');
  }
  async getSegmentsByNewsroom(newsroomId: number): Promise<Segment[]> {
    return [];
  }
  async createSegment(segment: InsertSegment): Promise<Segment> {
    throw new Error('MemStorage not implemented');
  }
  async updateSegment(id: number, segment: Partial<InsertSegment>): Promise<Segment> {
    throw new Error('MemStorage not implemented');
  }
  async deleteSegment(id: number): Promise<void> {
    throw new Error('MemStorage not implemented');
  }

  // Campaign Evaluations (stub for MemStorage - not used in production)
  async getCampaignEvaluation(id: number): Promise<CampaignEvaluation | undefined> {
    throw new Error('MemStorage not implemented');
  }
  async getEvaluationsByCampaign(campaignId: number): Promise<CampaignEvaluation[]> {
    return [];
  }
  async createCampaignEvaluation(evaluation: InsertCampaignEvaluation): Promise<CampaignEvaluation> {
    throw new Error('MemStorage not implemented');
  }

  // Story Summaries (stub for MemStorage - not used in production)
  async getStorySummary(id: number): Promise<StorySummary | undefined> {
    throw new Error('MemStorage not implemented');
  }
  async getStorySummariesByNewsroom(newsroomId: number): Promise<StorySummary[]> {
    return [];
  }
  async createStorySummary(summary: InsertStorySummary): Promise<StorySummary> {
    throw new Error('MemStorage not implemented');
  }
  async deleteStorySummary(id: number): Promise<void> {
    throw new Error('MemStorage not implemented');
  }

  // Prompt Categories (stub for MemStorage - not used in production)
  async getPromptCategory(id: number): Promise<PromptCategory | undefined> {
    throw new Error('MemStorage not implemented');
  }
  async getAllPromptCategories(): Promise<PromptCategory[]> {
    return [];
  }
  async createPromptCategory(category: InsertPromptCategory): Promise<PromptCategory> {
    throw new Error('MemStorage not implemented');
  }

  // Prompts (stub for MemStorage - not used in production)
  async getPrompt(id: number): Promise<Prompt | undefined> {
    throw new Error('MemStorage not implemented');
  }
  async getPromptByKey(key: string): Promise<Prompt | undefined> {
    throw new Error('MemStorage not implemented');
  }
  async getPromptsByCategory(categoryId: number): Promise<Prompt[]> {
    return [];
  }
  async getAllPrompts(): Promise<Prompt[]> {
    return [];
  }
  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    throw new Error('MemStorage not implemented');
  }
  async updatePrompt(id: number, prompt: Partial<InsertPrompt>): Promise<Prompt> {
    throw new Error('MemStorage not implemented');
  }
  async deletePrompt(id: number): Promise<void> {
    throw new Error('MemStorage not implemented');
  }

  // Prompt Versions (stub for MemStorage - not used in production)
  async getPromptVersions(promptId: number): Promise<PromptVersion[]> {
    return [];
  }
  async createPromptVersion(version: InsertPromptVersion): Promise<PromptVersion> {
    throw new Error('MemStorage not implemented');
  }
  
  // Client Logs (stub for MemStorage - not used in production)
  async createClientLogs(logs: InsertClientLog[]): Promise<void> {
    throw new Error('MemStorage not implemented');
  }
  async getClientLogs(filters: { userId?: number; newsroomId?: number; level?: string; limit?: number; offset?: number }): Promise<ClientLog[]> {
    return [];
  }
  async deleteOldLogs(daysToKeep: number): Promise<void> {
    throw new Error('MemStorage not implemented');
  }
  
  // User Flags (stub for MemStorage - not used in production)
  async createUserFlag(flag: InsertUserFlag): Promise<UserFlag> {
    throw new Error('MemStorage not implemented');
  }
  async getUserFlags(userId: number): Promise<UserFlag[]> {
    return [];
  }
  async getAllUserFlags(): Promise<(UserFlag & { userName: string; newsroomName?: string })[]> {
    return [];
  }
  async updateUserFlag(id: number, updates: Partial<InsertUserFlag>): Promise<UserFlag> {
    throw new Error('MemStorage not implemented');
  }
  async deleteUserFlag(id: number): Promise<void> {
    throw new Error('MemStorage not implemented');
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByNewsroomId(newsroomId: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.newsroomId, newsroomId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getNewsroom(id: number): Promise<Newsroom | undefined> {
    const [newsroom] = await db.select().from(newsrooms).where(eq(newsrooms.id, id));
    return newsroom || undefined;
  }

  async getNewsroomBySlug(slug: string): Promise<Newsroom | undefined> {
    const [newsroom] = await db.select().from(newsrooms).where(eq(newsrooms.slug, slug));
    return newsroom || undefined;
  }

  async createNewsroom(insertNewsroom: InsertNewsroom): Promise<Newsroom> {
    const [newsroom] = await db
      .insert(newsrooms)
      .values(insertNewsroom)
      .returning();
    return newsroom;
  }

  async getAllNewsrooms(): Promise<Newsroom[]> {
    return await db.select().from(newsrooms);
  }

  async updateNewsroom(id: number, updates: Partial<InsertNewsroom>): Promise<Newsroom> {
    const [newsroom] = await db
      .update(newsrooms)
      .set(updates)
      .where(eq(newsrooms.id, id))
      .returning();
    return newsroom;
  }

  // Brand Stylesheets
  async getBrandStylesheet(id: number): Promise<BrandStylesheet | undefined> {
    const [stylesheet] = await db.select().from(brandStylesheets).where(eq(brandStylesheets.id, id));
    return stylesheet || undefined;
  }

  async getBrandStylesheetsByNewsroom(newsroomId: number): Promise<BrandStylesheet[]> {
    return await db.select().from(brandStylesheets).where(eq(brandStylesheets.newsroomId, newsroomId));
  }

  async getAllBrandStylesheets(): Promise<BrandStylesheet[]> {
    return await db.select().from(brandStylesheets);
  }

  async createBrandStylesheet(insertStylesheet: InsertBrandStylesheet): Promise<BrandStylesheet> {
    const [stylesheet] = await db
      .insert(brandStylesheets)
      .values(insertStylesheet)
      .returning();
    return stylesheet;
  }

  async updateBrandStylesheet(id: number, updates: Partial<InsertBrandStylesheet>): Promise<BrandStylesheet> {
    const [stylesheet] = await db
      .update(brandStylesheets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(brandStylesheets.id, id))
      .returning();
    return stylesheet;
  }

  async deleteBrandStylesheet(id: number): Promise<void> {
    await db.delete(brandStylesheets).where(eq(brandStylesheets.id, id));
  }

  // Campaigns
  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async getCampaignsByNewsroom(newsroomId: number): Promise<Campaign[]> {
    return await db.select().from(campaigns)
      .where(eq(campaigns.newsroomId, newsroomId))
      .orderBy(desc(campaigns.createdAt));
  }

  async getAllCampaigns(): Promise<(Campaign & { newsroomName: string })[]> {
    return await db.select({
      id: campaigns.id,
      newsroomId: campaigns.newsroomId,
      title: campaigns.title,
      type: campaigns.type,
      objective: campaigns.objective,
      context: campaigns.context,
      aiModel: campaigns.aiModel,
      brandStylesheetId: campaigns.brandStylesheetId,
      status: campaigns.status,
      content: campaigns.content,
      metrics: campaigns.metrics,
      parentCampaignId: campaigns.parentCampaignId,
      draftNumber: campaigns.draftNumber,
      selectedForMerge: campaigns.selectedForMerge,
      createdAt: campaigns.createdAt,
      updatedAt: campaigns.updatedAt,
      newsroomName: newsrooms.name,
    })
    .from(campaigns)
    .innerJoin(newsrooms, eq(campaigns.newsroomId, newsrooms.id))
    .orderBy(desc(campaigns.createdAt));
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const [campaign] = await db
      .insert(campaigns)
      .values(insertCampaign)
      .returning();
    return campaign;
  }

  async updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign> {
    const [campaign] = await db
      .update(campaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(campaigns.id, id))
      .returning();
    return campaign;
  }

  async deleteCampaign(id: number): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  // Campaign Templates
  async getCampaignTemplate(id: number): Promise<CampaignTemplate | undefined> {
    const [template] = await db.select().from(campaignTemplates).where(eq(campaignTemplates.id, id));
    return template || undefined;
  }

  async getCampaignTemplates(): Promise<CampaignTemplate[]> {
    return await db.select().from(campaignTemplates);
  }

  async createCampaignTemplate(insertTemplate: InsertCampaignTemplate): Promise<CampaignTemplate> {
    const [template] = await db
      .insert(campaignTemplates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  // Segments
  async getSegment(id: number): Promise<Segment | undefined> {
    const segment = await db.select().from(segments).where(eq(segments.id, id));
    return segment[0];
  }

  async getSegmentsByNewsroom(newsroomId: number): Promise<Segment[]> {
    return await db.select().from(segments).where(eq(segments.newsroomId, newsroomId));
  }

  async createSegment(segment: InsertSegment): Promise<Segment> {
    const [newSegment] = await db.insert(segments).values(segment).returning();
    return newSegment;
  }

  async updateSegment(id: number, updates: Partial<InsertSegment>): Promise<Segment> {
    const [updated] = await db
      .update(segments)
      .set(updates)
      .where(eq(segments.id, id))
      .returning();
    return updated;
  }

  async deleteSegment(id: number): Promise<void> {
    await db.delete(segments).where(eq(segments.id, id));
  }

  // Campaign Evaluations
  async getCampaignEvaluation(id: number): Promise<CampaignEvaluation | undefined> {
    const evaluation = await db.select().from(campaignEvaluations).where(eq(campaignEvaluations.id, id));
    return evaluation[0];
  }

  async getEvaluationsByCampaign(campaignId: number): Promise<CampaignEvaluation[]> {
    return await db.select().from(campaignEvaluations).where(eq(campaignEvaluations.campaignId, campaignId));
  }

  async createCampaignEvaluation(evaluation: InsertCampaignEvaluation): Promise<CampaignEvaluation> {
    const [newEvaluation] = await db.insert(campaignEvaluations).values(evaluation).returning();
    return newEvaluation;
  }

  // Story Summaries
  async getStorySummary(id: number): Promise<StorySummary | undefined> {
    const [summary] = await db.select().from(storySummaries).where(eq(storySummaries.id, id));
    return summary || undefined;
  }

  async getStorySummariesByNewsroom(newsroomId: number): Promise<StorySummary[]> {
    return await db.select().from(storySummaries).where(eq(storySummaries.newsroomId, newsroomId)).orderBy(desc(storySummaries.createdAt));
  }

  async createStorySummary(summary: InsertStorySummary): Promise<StorySummary> {
    const [newSummary] = await db.insert(storySummaries).values(summary).returning();
    return newSummary;
  }

  async deleteStorySummary(id: number): Promise<void> {
    await db.delete(storySummaries).where(eq(storySummaries.id, id));
  }

  // Prompt Categories
  async getPromptCategory(id: number): Promise<PromptCategory | undefined> {
    const [category] = await db.select().from(promptCategories).where(eq(promptCategories.id, id));
    return category || undefined;
  }

  async getAllPromptCategories(): Promise<PromptCategory[]> {
    return await db.select().from(promptCategories).orderBy(promptCategories.name);
  }

  async createPromptCategory(category: InsertPromptCategory): Promise<PromptCategory> {
    const [newCategory] = await db.insert(promptCategories).values(category).returning();
    return newCategory;
  }

  // Prompts
  async getPrompt(id: number): Promise<Prompt | undefined> {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
    return prompt || undefined;
  }

  async getPromptByKey(key: string): Promise<Prompt | undefined> {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.promptKey, key));
    return prompt || undefined;
  }

  async getPromptsByCategory(categoryId: number): Promise<Prompt[]> {
    return await db.select().from(prompts).where(eq(prompts.categoryId, categoryId)).orderBy(prompts.name);
  }

  async getAllPrompts(): Promise<Prompt[]> {
    return await db.select().from(prompts).orderBy(prompts.categoryId, prompts.name);
  }

  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    const [newPrompt] = await db.insert(prompts).values(prompt).returning();
    return newPrompt;
  }

  async updatePrompt(id: number, updates: Partial<InsertPrompt>): Promise<Prompt> {
    const [updated] = await db
      .update(prompts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(prompts.id, id))
      .returning();
    return updated;
  }

  async deletePrompt(id: number): Promise<void> {
    await db.delete(prompts).where(eq(prompts.id, id));
  }

  // Prompt Versions
  async getPromptVersions(promptId: number): Promise<PromptVersion[]> {
    return await db.select().from(promptVersions).where(eq(promptVersions.promptId, promptId)).orderBy(desc(promptVersions.createdAt));
  }

  async createPromptVersion(version: InsertPromptVersion): Promise<PromptVersion> {
    const [newVersion] = await db.insert(promptVersions).values(version).returning();
    return newVersion;
  }
  
  // Client Logs
  async createClientLogs(logs: InsertClientLog[]): Promise<void> {
    if (logs.length === 0) return;
    await db.insert(clientLogs).values(logs);
  }
  
  async getClientLogs(filters: { userId?: number; newsroomId?: number; level?: string; limit?: number; offset?: number }): Promise<ClientLog[]> {
    let queryBuilder = db.select().from(clientLogs);
    
    const conditions = [];
    if (filters.userId !== undefined) {
      conditions.push(eq(clientLogs.userId, filters.userId));
    }
    if (filters.newsroomId !== undefined) {
      conditions.push(eq(clientLogs.newsroomId, filters.newsroomId));
    }
    if (filters.level) {
      conditions.push(eq(clientLogs.level, filters.level));
    }
    
    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(conditions.length === 1 ? conditions[0] : conditions.reduce((acc, cond) => eq(acc, cond)));
    }
    
    const logs = await queryBuilder
      .orderBy(desc(clientLogs.createdAt))
      .limit(filters.limit || 100)
      .offset(filters.offset || 0);
    
    return logs;
  }
  
  async deleteOldLogs(daysToKeep: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    await db.delete(clientLogs).where(eq(clientLogs.createdAt, cutoffDate));
  }
  
  // User Flags
  async createUserFlag(flag: InsertUserFlag): Promise<UserFlag> {
    const [newFlag] = await db.insert(userFlags).values(flag).returning();
    return newFlag;
  }
  
  async getUserFlags(userId: number): Promise<UserFlag[]> {
    return await db.select().from(userFlags).where(eq(userFlags.userId, userId)).orderBy(desc(userFlags.createdAt));
  }
  
  async getAllUserFlags(): Promise<(UserFlag & { userName: string; newsroomName?: string })[]> {
    const flags = await db
      .select({
        id: userFlags.id,
        userId: userFlags.userId,
        newsroomId: userFlags.newsroomId,
        flagType: userFlags.flagType,
        reason: userFlags.reason,
        notes: userFlags.notes,
        flaggedBy: userFlags.flaggedBy,
        createdAt: userFlags.createdAt,
        updatedAt: userFlags.updatedAt,
        userName: users.name,
        newsroomName: newsrooms.name,
      })
      .from(userFlags)
      .leftJoin(users, eq(userFlags.userId, users.id))
      .leftJoin(newsrooms, eq(userFlags.newsroomId, newsrooms.id))
      .orderBy(desc(userFlags.createdAt));
    
    return flags;
  }
  
  async updateUserFlag(id: number, updates: Partial<InsertUserFlag>): Promise<UserFlag> {
    const [updated] = await db
      .update(userFlags)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userFlags.id, id))
      .returning();
    
    if (!updated) {
      throw new Error(`UserFlag with id ${id} not found`);
    }
    
    return updated;
  }
  
  async deleteUserFlag(id: number): Promise<void> {
    await db.delete(userFlags).where(eq(userFlags.id, id));
  }
}

// Create a function to initialize sample data in the database
async function initializeSampleData() {
  try {
    // Check if data already exists
    const existingNewsrooms = await db.select().from(newsrooms).limit(1);
    if (existingNewsrooms.length > 0) {
      return; // Data already exists
    }

    // Create admin user first
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    await db.insert(users).values({
      email: "admin@campaigncraft.com",
      passwordHash: adminPasswordHash,
      name: "System Administrator",
      role: "admin",
      newsroomId: null, // Super admin has no specific newsroom
    });

    // Create sample newsroom
    const [sampleNewsroom] = await db.insert(newsrooms).values({
      name: "Metro Daily News",
      slug: "metro-daily",
      description: "Local news and investigative journalism",
      website: "https://metrodaily.com",
      logo: null,
    }).returning();

    // Create sample brand stylesheet
    await db.insert(brandStylesheets).values({
      newsroomId: sampleNewsroom.id,
      name: "Metro Daily - Default Style",
      description: "Standard brand voice and messaging",
      tone: "Professional yet approachable",
      voice: "Informative, trustworthy, community-focused",
      keyMessages: [
        "Independent local journalism matters",
        "Community-driven news coverage",
        "Transparency in reporting"
      ],
      colorPalette: {
        primary: "#2563EB",
        secondary: "#64748B",
        accent: "#10B981"
      },
      typography: {
        headlines: "Inter",
        body: "Inter"
      },
      guidelines: "Focus on local impact, use active voice, include community perspectives",
      isDefault: true,
    });

    // Create sample campaign templates
    const templates = [
      {
        name: "Breaking News Alert",
        description: "Rapid-response template for urgent news coverage with donation CTA",
        type: "email",
        icon: "fas fa-bolt",
        setupTime: "2-3 min setup",
        template: {
          subject: "Breaking: {{headline}}",
          structure: "urgent_news",
          cta: "donation"
        },
        isPublic: true,
      },
      {
        name: "Monthly Supporter Drive",
        description: "Convert one-time donors to recurring supporters with impact stories",
        type: "email",
        icon: "fas fa-heart",
        setupTime: "5-7 min setup",
        template: {
          subject: "Your support makes a difference",
          structure: "impact_story",
          cta: "monthly_subscription"
        },
        isPublic: true,
      },
      {
        name: "Social Engagement",
        description: "Multi-platform social campaign to drive website traffic and subscriptions",
        type: "social",
        icon: "fas fa-share-alt",
        setupTime: "3-4 min setup",
        template: {
          platforms: ["twitter", "facebook", "instagram"],
          structure: "engagement_focused",
          cta: "website_visit"
        },
        isPublic: true,
      }
    ];

    await db.insert(campaignTemplates).values(templates);
    
    console.log("Sample data initialized successfully");
  } catch (error) {
    console.error("Error initializing sample data:", error);
  }
}

export const storage = new DatabaseStorage();

// Cleanup old client logs (older than 90 days)
export async function cleanupOldLogs(): Promise<void> {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await db
      .delete(clientLogs)
      .where(lt(clientLogs.createdAt, ninetyDaysAgo));

    console.log(`Cleaned up client logs older than 90 days`);
  } catch (error) {
    console.error("Error cleaning up old logs:", error);
    throw error;
  }
}

// Initialize sample data when the module loads
initializeSampleData();
