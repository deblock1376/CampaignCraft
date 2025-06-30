import { 
  newsrooms, 
  brandStylesheets, 
  campaigns, 
  campaignTemplates,
  type Newsroom,
  type BrandStylesheet,
  type Campaign,
  type CampaignTemplate,
  type InsertNewsroom,
  type InsertBrandStylesheet,
  type InsertCampaign,
  type InsertCampaignTemplate
} from "@shared/schema";

export interface IStorage {
  // Newsrooms
  getNewsroom(id: number): Promise<Newsroom | undefined>;
  getNewsroomBySlug(slug: string): Promise<Newsroom | undefined>;
  createNewsroom(newsroom: InsertNewsroom): Promise<Newsroom>;
  
  // Brand Stylesheets
  getBrandStylesheet(id: number): Promise<BrandStylesheet | undefined>;
  getBrandStylesheetsByNewsroom(newsroomId: number): Promise<BrandStylesheet[]>;
  createBrandStylesheet(stylesheet: InsertBrandStylesheet): Promise<BrandStylesheet>;
  updateBrandStylesheet(id: number, stylesheet: Partial<InsertBrandStylesheet>): Promise<BrandStylesheet>;
  deleteBrandStylesheet(id: number): Promise<void>;
  
  // Campaigns
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignsByNewsroom(newsroomId: number): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign>;
  deleteCampaign(id: number): Promise<void>;
  
  // Campaign Templates
  getCampaignTemplate(id: number): Promise<CampaignTemplate | undefined>;
  getCampaignTemplates(): Promise<CampaignTemplate[]>;
  createCampaignTemplate(template: InsertCampaignTemplate): Promise<CampaignTemplate>;
}

export class MemStorage implements IStorage {
  private newsrooms: Map<number, Newsroom>;
  private brandStylesheets: Map<number, BrandStylesheet>;
  private campaigns: Map<number, Campaign>;
  private campaignTemplates: Map<number, CampaignTemplate>;
  private currentId: number;

  constructor() {
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
      createdAt: new Date(),
    };
    this.newsrooms.set(id, newsroom);
    return newsroom;
  }

  // Brand Stylesheets
  async getBrandStylesheet(id: number): Promise<BrandStylesheet | undefined> {
    return this.brandStylesheets.get(id);
  }

  async getBrandStylesheetsByNewsroom(newsroomId: number): Promise<BrandStylesheet[]> {
    return Array.from(this.brandStylesheets.values()).filter(s => s.newsroomId === newsroomId);
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
}

export const storage = new MemStorage();
