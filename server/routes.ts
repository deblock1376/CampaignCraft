import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { aiProviderService } from "./services/ai-providers";
import { insertBrandStylesheetSchema, insertCampaignSchema, insertCampaignTemplateSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.log('JWT verification error:', err.message, 'Token:', token.substring(0, 20) + '...');
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.log('Token verified successfully for user:', user.userId);
    req.user = user;
    next();
  });
};

// Admin-only middleware
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await storage.getUser(req.user.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Only allow admin@campaigncraft.com account
    if (user.email !== 'admin@campaigncraft.com' || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id, newsroomId: user.newsroomId }, JWT_SECRET, { expiresIn: "7d" });
      
      // Get user's newsroom info
      const newsroom = user.newsroomId ? await storage.getNewsroom(user.newsroomId) : null;
      
      // Check if newsroom is active (unless it's a super admin)
      if (newsroom && !newsroom.isActive && user.role !== 'admin') {
        return res.status(403).json({ message: "Account access has been suspended. Please contact support." });
      }
      
      res.json({ 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          newsroomId: user.newsroomId,
          newsroom: newsroom 
        }, 
        token 
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Newsrooms
  app.get("/api/newsrooms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const newsroom = await storage.getNewsroom(id);
      if (!newsroom) {
        return res.status(404).json({ message: "Newsroom not found" });
      }
      res.json(newsroom);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch newsroom" });
    }
  });

  app.get("/api/newsrooms/slug/:slug", async (req, res) => {
    try {
      const newsroom = await storage.getNewsroomBySlug(req.params.slug);
      if (!newsroom) {
        return res.status(404).json({ message: "Newsroom not found" });
      }
      res.json(newsroom);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch newsroom" });
    }
  });

  // Brand Stylesheets
  app.get("/api/brand-stylesheets", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const stylesheets = await storage.getAllBrandStylesheets();
      res.json(stylesheets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all brand stylesheets" });
    }
  });

  app.get("/api/newsrooms/:newsroomId/stylesheets", async (req, res) => {
    try {
      const newsroomId = parseInt(req.params.newsroomId);
      const stylesheets = await storage.getBrandStylesheetsByNewsroom(newsroomId);
      res.json(stylesheets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brand stylesheets" });
    }
  });

  app.post("/api/newsrooms/:newsroomId/stylesheets", async (req, res) => {
    try {
      const newsroomId = parseInt(req.params.newsroomId);
      const validatedData = insertBrandStylesheetSchema.parse({
        ...req.body,
        newsroomId,
      });
      const stylesheet = await storage.createBrandStylesheet(validatedData);
      res.status(201).json(stylesheet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create brand stylesheet" });
    }
  });

  app.put("/api/stylesheets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertBrandStylesheetSchema.partial().parse(req.body);
      const stylesheet = await storage.updateBrandStylesheet(id, updates);
      res.json(stylesheet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update brand stylesheet" });
    }
  });

  app.delete("/api/stylesheets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBrandStylesheet(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete brand stylesheet" });
    }
  });

  // Campaigns
  app.get("/api/newsrooms/:newsroomId/campaigns", authenticateToken, async (req: any, res) => {
    try {
      const newsroomId = parseInt(req.params.newsroomId);
      const campaigns = await storage.getCampaignsByNewsroom(newsroomId);
      
      // Get newsroom info to include name in response
      const newsroom = await storage.getNewsroom(newsroomId);
      const campaignsWithNewsroom = campaigns.map(campaign => ({
        ...campaign,
        newsroomName: newsroom?.name || 'Unknown Newsroom'
      }));
      
      res.json(campaignsWithNewsroom);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/campaigns/:id", authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  app.post("/api/newsrooms/:newsroomId/campaigns", authenticateToken, async (req: any, res) => {
    try {
      const newsroomId = parseInt(req.params.newsroomId);
      const validatedData = insertCampaignSchema.parse({
        ...req.body,
        newsroomId,
      });
      const campaign = await storage.createCampaign(validatedData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  app.put("/api/campaigns/:id", authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertCampaignSchema.partial().parse(req.body);
      const campaign = await storage.updateCampaign(id, updates);
      res.json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });

  // Campaign Generation
  app.post("/api/campaigns/generate", async (req, res) => {
    try {
      const schema = z.object({
        type: z.enum(['email', 'social', 'web']),
        objective: z.enum(['subscription', 'donation', 'membership', 'engagement']),
        context: z.string(),
        aiModel: z.string(),
        brandStylesheetId: z.number(),
        newsroomId: z.number(),
      });

      const validatedData = schema.parse(req.body);
      
      // Get brand stylesheet
      const brandStylesheet = await storage.getBrandStylesheet(validatedData.brandStylesheetId);
      if (!brandStylesheet) {
        return res.status(404).json({ message: "Brand stylesheet not found" });
      }

      // Get newsroom
      const newsroom = await storage.getNewsroom(validatedData.newsroomId);
      if (!newsroom) {
        return res.status(404).json({ message: "Newsroom not found" });
      }

      // Generate campaign using AI
      const campaignRequest = {
        type: validatedData.type,
        objective: validatedData.objective,
        context: validatedData.context,
        brandStylesheet: {
          tone: brandStylesheet.tone,
          voice: brandStylesheet.voice,
          keyMessages: brandStylesheet.keyMessages || [],
          guidelines: brandStylesheet.guidelines || '',
        },
        newsroomName: brandStylesheet.name.includes("Style") ? newsroom.name : brandStylesheet.name,
      };

      const generatedCampaign = await aiProviderService.generateCampaign(
        campaignRequest, 
        validatedData.aiModel
      );

      // Save the generated campaign
      const campaign = await storage.createCampaign({
        newsroomId: validatedData.newsroomId,
        title: generatedCampaign.subject || `${validatedData.type} Campaign`,
        type: validatedData.type,
        objective: validatedData.objective,
        context: validatedData.context,
        aiModel: validatedData.aiModel,
        brandStylesheetId: validatedData.brandStylesheetId,
        status: 'draft',
        content: generatedCampaign,
        metrics: generatedCampaign.metrics,
      });

      res.json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to generate campaign", error: String(error) });
    }
  });

  // Multi-Draft Campaign Generation
  app.post("/api/campaigns/generate-drafts", async (req, res) => {
    try {
      const schema = z.object({
        type: z.enum(['email', 'social', 'web']),
        objective: z.enum(['subscription', 'donation', 'membership', 'engagement']),
        context: z.string(),
        aiModel: z.string(),
        brandStylesheetId: z.number(),
        newsroomId: z.number(),
        draftCount: z.number().min(1).max(10).default(5),
      });

      const validatedData = schema.parse(req.body);
      
      // Get brand stylesheet
      const brandStylesheet = await storage.getBrandStylesheet(validatedData.brandStylesheetId);
      if (!brandStylesheet) {
        return res.status(404).json({ message: "Brand stylesheet not found" });
      }

      // Get newsroom
      const newsroom = await storage.getNewsroom(validatedData.newsroomId);
      if (!newsroom) {
        return res.status(404).json({ message: "Newsroom not found" });
      }

      // Base campaign request
      const baseCampaignRequest = {
        type: validatedData.type,
        objective: validatedData.objective,
        context: validatedData.context,
        brandStylesheet: {
          tone: brandStylesheet.tone,
          voice: brandStylesheet.voice,
          keyMessages: brandStylesheet.keyMessages || [],
          guidelines: brandStylesheet.guidelines || '',
        },
        newsroomName: brandStylesheet.name.includes("Style") ? newsroom.name : brandStylesheet.name,
      };

      // Generate multiple draft variations
      const draftPromises = [];
      const variationPrompts = [
        "Create a compelling campaign with strong emotional appeal",
        "Create a data-driven campaign emphasizing facts and credibility",
        "Create an urgent campaign with clear call-to-action",
        "Create a storytelling-focused campaign with narrative elements",
        "Create a concise, direct campaign optimized for quick engagement",
      ];

      for (let i = 0; i < validatedData.draftCount; i++) {
        const variationContext = `${validatedData.context}\n\nVariation ${i + 1}: ${variationPrompts[i] || 'Create a unique campaign variation'}`;
        const campaignRequest = {
          ...baseCampaignRequest,
          context: variationContext,
        };

        draftPromises.push(
          aiProviderService.generateCampaign(campaignRequest, validatedData.aiModel)
            .then(async (generatedCampaign) => {
              return await storage.createCampaign({
                newsroomId: validatedData.newsroomId,
                title: generatedCampaign.subject || `${validatedData.type} Campaign - Variation ${i + 1}`,
                type: validatedData.type,
                objective: validatedData.objective,
                context: validatedData.context,
                aiModel: validatedData.aiModel,
                brandStylesheetId: validatedData.brandStylesheetId,
                status: 'draft',
                content: generatedCampaign,
                metrics: generatedCampaign.metrics,
                draftNumber: i + 1,
                parentCampaignId: null, // Will be updated after we have the first draft's ID
                selectedForMerge: false,
              });
            })
        );
      }

      const drafts = await Promise.all(draftPromises);
      
      // Defensive guard: ensure we have at least one draft
      if (!drafts || drafts.length === 0) {
        return res.status(500).json({ 
          message: "Failed to generate campaign drafts", 
          error: "No drafts were generated by the AI provider" 
        });
      }
      
      // Update all drafts to reference the first one as the parent
      const parentCampaignId = drafts[0].id;
      const updatedDrafts = [];
      
      for (let i = 0; i < drafts.length; i++) {
        const updated = await storage.updateCampaign(drafts[i].id, { parentCampaignId });
        updatedDrafts.push(updated);
      }

      res.json(updatedDrafts);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error('Multi-draft generation error:', error);
      res.status(500).json({ message: "Failed to generate campaign drafts", error: String(error) });
    }
  });

  // Merge Campaign Drafts
  app.post("/api/campaigns/merge-drafts", async (req, res) => {
    try {
      const schema = z.object({
        draftIds: z.array(z.number()).min(2),
        newsroomId: z.number(),
      });

      const { draftIds, newsroomId } = schema.parse(req.body);

      // Fetch all selected drafts
      const draftResults = await Promise.all(
        draftIds.map(id => storage.getCampaign(id))
      );

      // Validate all drafts exist and belong to the same newsroom
      const drafts = draftResults.filter(d => d && d.newsroomId === newsroomId);
      if (drafts.length !== draftIds.length || drafts.length === 0) {
        return res.status(400).json({ message: "Invalid draft selection" });
      }

      const firstDraft = drafts[0];

      // Merge logic: combine best elements from selected drafts
      const mergedContent: any = {
        subject: (firstDraft.content as any)?.subject || "Merged Campaign",
        body: drafts.map((d: any) => d.content?.body).filter(Boolean).join("\n\n"),
        cta: (firstDraft.content as any)?.cta || "Learn More",
      };

      // Create merged campaign
      const mergedCampaign = await storage.createCampaign({
        newsroomId,
        title: `Merged: ${firstDraft.title}`,
        type: firstDraft.type,
        objective: firstDraft.objective,
        context: firstDraft.context || "",
        aiModel: firstDraft.aiModel,
        brandStylesheetId: firstDraft.brandStylesheetId || null,
        status: 'draft',
        content: mergedContent,
        parentCampaignId: firstDraft.parentCampaignId || null,
        draftNumber: null, // Merged campaigns don't have a draft number
        selectedForMerge: false,
      });

      // Mark selected drafts as used for merge
      await Promise.all(
        draftIds.map(id => storage.updateCampaign(id, { selectedForMerge: true }))
      );

      res.json(mergedCampaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error('Merge drafts error:', error);
      res.status(500).json({ message: "Failed to merge drafts", error: String(error) });
    }
  });

  // Segment Management Routes
  app.get("/api/newsrooms/:newsroomId/segments", async (req, res) => {
    try {
      const newsroomId = parseInt(req.params.newsroomId);
      const segments = await storage.getSegmentsByNewsroom(newsroomId);
      res.json(segments);
    } catch (error) {
      console.error('Get segments error:', error);
      res.status(500).json({ message: "Failed to retrieve segments", error: String(error) });
    }
  });

  app.post("/api/newsrooms/:newsroomId/segments", async (req, res) => {
    try {
      const newsroomId = parseInt(req.params.newsroomId);
      const schema = z.object({
        name: z.string().min(1),
        description: z.string().min(1),
      });

      const { name, description } = schema.parse(req.body);

      const segment = await storage.createSegment({
        newsroomId,
        name,
        description,
      });

      res.json(segment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error('Create segment error:', error);
      res.status(500).json({ message: "Failed to create segment", error: String(error) });
    }
  });

  app.patch("/api/segments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const schema = z.object({
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
      });

      const updates = schema.parse(req.body);
      const segment = await storage.updateSegment(id, updates);

      res.json(segment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error('Update segment error:', error);
      res.status(500).json({ message: "Failed to update segment", error: String(error) });
    }
  });

  app.delete("/api/segments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSegment(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete segment error:', error);
      res.status(500).json({ message: "Failed to delete segment", error: String(error) });
    }
  });

  // Campaign Evaluation
  app.post("/api/campaigns/evaluate", async (req, res) => {
    try {
      const schema = z.object({
        campaignContent: z.string().min(1),
        campaignType: z.string(),
        framework: z.enum(['bluelena', 'audience_value_prop']),
        newsroomId: z.number(),
        aiModel: z.string().optional(),
      });

      const { campaignContent, campaignType, framework, newsroomId, aiModel } = schema.parse(req.body);

      const evaluation = await aiProviderService.evaluateCampaign(
        campaignContent,
        campaignType,
        framework,
        aiModel || 'claude-sonnet-4-20250514'
      );

      res.json(evaluation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error('Campaign evaluation error:', error);
      res.status(500).json({ message: "Failed to evaluate campaign", error: String(error) });
    }
  });

  // AI Rewrite Campaign
  app.post("/api/campaigns/ai-rewrite", async (req, res) => {
    try {
      const schema = z.object({
        originalContent: z.string().min(1),
        recommendations: z.array(z.string()),
        campaignType: z.string(),
        newsroomId: z.number(),
        aiModel: z.string().optional(),
      });

      const { originalContent, recommendations, campaignType, aiModel } = schema.parse(req.body);

      const rewrittenContent = await aiProviderService.rewriteCampaign(
        originalContent,
        recommendations,
        campaignType,
        aiModel || 'claude-sonnet-4-20250514'
      );

      res.json({ rewrittenContent });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error('AI rewrite error:', error);
      res.status(500).json({ message: "Failed to rewrite campaign", error: String(error) });
    }
  });

  // Quick Start Tools
  app.post("/api/quickstart/rapid-response", authenticateToken, async (req: any, res) => {
    try {
      const { headline, urgency, newsroomId, brandStylesheetId, articleSummary, aiModel } = req.body;
      
      if (!newsroomId || (!headline && !articleSummary)) {
        return res.status(400).json({ message: "Newsroom and either headline or article summary are required" });
      }
      
      // Generate headline from summary if not provided
      const campaignHeadline = headline || (articleSummary ? articleSummary.split('.')[0].trim() : 'Breaking News Alert');

      const newsroom = await storage.getNewsroom(newsroomId);
      if (!newsroom) {
        return res.status(404).json({ message: "Newsroom not found" });
      }

      let brandStylesheet = null;
      if (brandStylesheetId) {
        brandStylesheet = await storage.getBrandStylesheet(brandStylesheetId);
      }

      const campaignRequest = {
        type: 'email' as const,
        objective: 'engagement' as const,
        context: `Breaking news alert: ${campaignHeadline}. Urgency level: ${urgency || 'high'}. ${articleSummary ? `Article summary: ${articleSummary}. ` : ''}Create a rapid response campaign that immediately informs our audience and drives engagement.`,
        brandStylesheet: brandStylesheet ? {
          name: brandStylesheet.name,
          tone: brandStylesheet.tone,
          voice: brandStylesheet.voice,
          keyMessages: brandStylesheet.keyMessages || [],
          guidelines: brandStylesheet.guidelines || '',
        } : {
          name: 'Default',
          tone: 'Professional, authoritative',
          voice: 'Clear and informative',
          keyMessages: ['Breaking news coverage', 'Community information'],
          guidelines: 'Focus on facts and urgency',
        },
        newsroomName: newsroom.name,
      };

      const generatedCampaign = await aiProviderService.generateCampaign(
        campaignRequest, 
        aiModel || 'claude-sonnet-4-20250514'
      );

      const campaign = await storage.createCampaign({
        newsroomId,
        title: `Breaking: ${campaignHeadline}`,
        type: 'email',
        objective: 'engagement',
        context: campaignRequest.context,
        aiModel: aiModel || 'claude-sonnet-4-20250514',
        brandStylesheetId: brandStylesheetId || null,
        status: 'draft',
        content: generatedCampaign,
      });

      res.json(campaign);
    } catch (error) {
      console.error("Rapid response campaign generation error:", error);
      res.status(500).json({ 
        message: "Failed to create rapid response campaign", 
        error: String(error),
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.post("/api/quickstart/rewrite-segments", authenticateToken, async (req: any, res) => {
    try {
      const { campaignId, segments, newsroomId } = req.body;
      
      if (!campaignId || !segments || !newsroomId) {
        return res.status(400).json({ message: "Campaign ID, segments, and newsroom are required" });
      }

      const originalCampaign = await storage.getCampaign(campaignId);
      if (!originalCampaign) {
        return res.status(404).json({ message: "Original campaign not found" });
      }

      const newsroom = await storage.getNewsroom(newsroomId);
      const brandStylesheet = originalCampaign.brandStylesheetId 
        ? await storage.getBrandStylesheet(originalCampaign.brandStylesheetId)
        : null;

      const segmentVariations = [];
      
      for (const segment of segments) {
        const campaignRequest = {
          type: originalCampaign.type as 'email' | 'social' | 'web',
          objective: originalCampaign.objective as 'subscription' | 'donation' | 'membership' | 'engagement',
          context: `${originalCampaign.context} \n\nRewrite this campaign specifically for the ${segment.name} segment. Target audience characteristics: ${segment.description}`,
          brandStylesheet: brandStylesheet ? {
            name: brandStylesheet.name,
            tone: brandStylesheet.tone,
            voice: brandStylesheet.voice,
            keyMessages: brandStylesheet.keyMessages || [],
            guidelines: brandStylesheet.guidelines || '',
          } : {
            name: 'Default',
            tone: 'Professional, targeted',
            voice: 'Audience-specific messaging',
            keyMessages: ['Segment-focused content'],
            guidelines: 'Tailor to audience segment',
          },
          newsroomName: newsroom?.name || '',
        };

        const generatedCampaign = await aiProviderService.generateCampaign(
          campaignRequest, 
          originalCampaign.aiModel
        );

        const segmentCampaign = await storage.createCampaign({
          newsroomId,
          title: `${originalCampaign.title} - ${segment.name}`,
          type: originalCampaign.type,
          objective: originalCampaign.objective,
          context: campaignRequest.context,
          aiModel: originalCampaign.aiModel,
          brandStylesheetId: originalCampaign.brandStylesheetId,
          status: 'draft',
          content: generatedCampaign,
        });

        segmentVariations.push(segmentCampaign);
      }

      res.json(segmentVariations);
    } catch (error) {
      res.status(500).json({ message: "Failed to create segment variations", error: String(error) });
    }
  });

  app.post("/api/quickstart/subject-lines", authenticateToken, async (req: any, res) => {
    try {
      const { context, campaignType, objective, count = 5 } = req.body;
      
      if (!context) {
        return res.status(400).json({ message: "Context is required" });
      }

      const prompt = `Generate ${count} compelling email subject lines for a ${campaignType || 'email'} campaign with ${objective || 'engagement'} objective. Context: ${context}. Make them varied in style - some urgent, some curious, some benefit-focused. Return as a JSON array of strings.`;

      const response = await aiProviderService.generateContent(prompt, 'claude-sonnet-4-20250514');
      
      let subjectLines;
      try {
        subjectLines = JSON.parse(response);
      } catch {
        // Fallback parsing if AI doesn't return pure JSON
        const lines = response.split('\n')
          .filter((line: string) => line.trim().length > 0)
          .map((line: string) => line.replace(/^[-•*\d.]\s*/, '').trim())
          .slice(0, count);
        subjectLines = lines;
      }

      res.json({ subjectLines });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate subject lines", error: String(error) });
    }
  });

  // Article Summarization endpoint
  app.post("/api/quickstart/summarize-article", authenticateToken, async (req: any, res) => {
    try {
      const { article, aiModel } = req.body;
      
      if (!article || !aiModel) {
        return res.status(400).json({ message: "Article text and AI model are required" });
      }

      // Create summarization prompt
      const prompt = `Please create a concise, compelling summary of this news article for use in a marketing campaign. 
      
The summary should:
- Be 2-3 sentences maximum
- Capture the key facts and importance
- Be engaging enough for email/social media campaigns
- Maintain journalistic accuracy

Article to summarize:
${article}

Please respond with just the summary text, no additional formatting or explanations.`;

      // Generate summary using selected AI model
      const summary = await aiProviderService.generateContent(prompt, aiModel);

      res.json({ summary: summary.trim() });
    } catch (error) {
      console.error("Article summarization error:", error);
      res.status(500).json({ 
        message: "Failed to summarize article", 
        error: String(error),
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.post("/api/quickstart/cta-buttons", authenticateToken, async (req: any, res) => {
    try {
      const { context, campaignType, objective, count = 5 } = req.body;
      
      if (!context) {
        return res.status(400).json({ message: "Context is required" });
      }

      const prompt = `Generate ${count} compelling call-to-action button texts for a ${campaignType || 'email'} campaign with ${objective || 'engagement'} objective. Context: ${context}. Make them action-oriented and persuasive. Return as a JSON array of strings.`;

      const response = await aiProviderService.generateContent(prompt, 'claude-sonnet-4-20250514');
      
      let ctaButtons;
      try {
        ctaButtons = JSON.parse(response);
      } catch {
        // Fallback parsing if AI doesn't return pure JSON
        const buttons = response.split('\n')
          .filter((line: string) => line.trim().length > 0)
          .map((line: string) => line.replace(/^[-•*\d.]\s*/, '').trim())
          .slice(0, count);
        ctaButtons = buttons;
      }

      res.json({ ctaButtons });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate CTA buttons", error: String(error) });
    }
  });

  app.post("/api/quickstart/grounding-library", authenticateToken, async (req: any, res) => {
    try {
      const { newsroomId, newsroomInfo, existingContent } = req.body;
      
      if (!newsroomId) {
        return res.status(400).json({ message: "Newsroom ID is required" });
      }

      const newsroom = await storage.getNewsroom(newsroomId);
      if (!newsroom) {
        return res.status(404).json({ message: "Newsroom not found" });
      }

      const prompt = `Create a comprehensive brand grounding guide for ${newsroom.name}. 
      
      Newsroom Information: ${newsroomInfo || newsroom.description || 'Local news organization'}
      Existing Content to Analyze: ${existingContent || 'No existing content provided'}
      
      Generate:
      1. Brand tone (2-3 descriptive words)
      2. Brand voice (1-2 sentences describing personality)
      3. 3-5 key messages
      4. Editorial guidelines (2-3 sentences)
      
      Return as JSON with keys: tone, voice, keyMessages (array), guidelines`;

      const response = await aiProviderService.generateContent(prompt, 'claude-sonnet-4-20250514');
      
      let brandGuide;
      try {
        brandGuide = JSON.parse(response);
      } catch {
        // Fallback if AI doesn't return proper JSON
        brandGuide = {
          tone: "Professional, trustworthy",
          voice: "Authoritative yet approachable, committed to community service and transparency.",
          keyMessages: [
            "Independent local journalism matters",
            "Community-driven news coverage", 
            "Transparency in reporting"
          ],
          guidelines: "Focus on local impact, use active voice, include community perspectives."
        };
      }

      const stylesheet = await storage.createBrandStylesheet({
        newsroomId,
        name: `${newsroom.name} - AI Generated Guide`,
        description: "Automatically generated brand guidelines based on newsroom analysis",
        tone: brandGuide.tone,
        voice: brandGuide.voice,
        keyMessages: brandGuide.keyMessages,
        guidelines: brandGuide.guidelines,
        isDefault: false,
      });

      res.json(stylesheet);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate grounding library", error: String(error) });
    }
  });

  // Campaign Templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getCampaignTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaign templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getCampaignTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // Admin routes (protected)
  app.get("/api/admin/newsrooms", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const newsrooms = await storage.getAllNewsrooms();
      const newsroomsWithUsers = await Promise.all(
        newsrooms.map(async (newsroom) => {
          const user = await storage.getUserByNewsroomId(newsroom.id);
          return { ...newsroom, user };
        })
      );
      res.json(newsroomsWithUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch newsrooms" });
    }
  });

  app.get("/api/admin/campaigns", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const campaigns = await storage.getAllCampaigns();
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching all campaigns:", error);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.patch("/api/admin/newsrooms/:id", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const newsroom = await storage.updateNewsroom(id, updates);
      res.json(newsroom);
    } catch (error) {
      res.status(500).json({ error: "Failed to update newsroom" });
    }
  });

  app.patch("/api/admin/users/:id", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, email, password } = req.body;
      
      // Check if email already exists for another user
      if (email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== id) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }

      // Prepare update data
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      
      // Hash password if provided
      if (password && password.trim()) {
        if (password.length < 6) {
          return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }
        updateData.passwordHash = await bcrypt.hash(password, 10);
      }

      const updatedUser = await storage.updateUser(id, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.post("/api/admin/accounts", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      console.log("Account creation request received:", req.body);

      const {
        newsroomName,
        newsroomSlug,
        description,
        website,
        adminName,
        adminEmail,
        password
      } = req.body;

      console.log("Creating account for:", { newsroomName, newsroomSlug, adminEmail });

      // Check if email or slug already exists
      const existingUser = await storage.getUserByEmail(adminEmail);
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const existingNewsroom = await storage.getNewsroomBySlug(newsroomSlug);
      if (existingNewsroom) {
        return res.status(400).json({ error: "Newsroom slug already exists" });
      }

      // Create newsroom
      const newsroom = await storage.createNewsroom({
        name: newsroomName,
        slug: newsroomSlug,
        description: description || null,
        website: website || null,
        logo: null,
        isActive: true,
      });

      // Hash password and create admin user
      const passwordHash = await bcrypt.hash(password, 10);
      const adminUser = await storage.createUser({
        email: adminEmail,
        passwordHash,
        name: adminName,
        role: "user",
        newsroomId: newsroom.id,
      });

      // Create default brand stylesheet for the newsroom
      await storage.createBrandStylesheet({
        newsroomId: newsroom.id,
        name: "Default Style",
        description: "Default brand guidelines",
        tone: "Professional and approachable",
        voice: "Clear, informative, and engaging",
        keyMessages: [
          "Quality journalism matters",
          "Community-focused reporting",
          "Transparency and accountability"
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
        guidelines: "Maintain a professional tone while being accessible to the community."
      });

      res.json({ 
        newsroom, 
        admin: { 
          id: adminUser.id, 
          name: adminUser.name, 
          email: adminUser.email 
        }
      });
    } catch (error) {
      console.error("Account creation error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  // Object Storage Routes for Document Upload
  app.post("/api/objects/upload", authenticateToken, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Route to serve uploaded documents  
  app.get("/objects/:objectPath(*)", authenticateToken, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "Document not found" });
      }
      return res.status(500).json({ error: "Failed to access document" });
    }
  });

  // Route to finalize document upload and add to grounding guide
  app.put("/api/grounding-guides/:id/documents", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { documentURL, filename } = req.body;
      
      if (!documentURL || !filename) {
        return res.status(400).json({ error: "Document URL and filename are required" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(documentURL);
      
      // Get current grounding guide
      const guide = await storage.getBrandStylesheet(parseInt(id));
      if (!guide) {
        return res.status(404).json({ error: "Grounding guide not found" });
      }

      // Check if user has access to this grounding guide
      if (req.user.newsroomId !== guide.newsroomId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Add document path to the grounding guide
      const currentPaths = guide.documentPaths || [];
      const documentInfo = `${filename}:${objectPath}`;
      
      if (!currentPaths.includes(documentInfo)) {
        currentPaths.push(documentInfo);
        
        await storage.updateBrandStylesheet(guide.id, {
          documentPaths: currentPaths
        });
      }

      res.json({ success: true, objectPath, filename });
    } catch (error) {
      console.error("Error adding document to grounding guide:", error);
      res.status(500).json({ error: "Failed to add document" });
    }
  });

  // Route to remove document from grounding guide
  app.delete("/api/grounding-guides/:id/documents", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { documentPath } = req.body;
      
      if (!documentPath) {
        return res.status(400).json({ error: "Document path is required" });
      }

      const guide = await storage.getBrandStylesheet(parseInt(id));
      if (!guide) {
        return res.status(404).json({ error: "Grounding guide not found" });
      }

      // Check if user has access to this grounding guide
      if (req.user.newsroomId !== guide.newsroomId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Remove document path from the grounding guide
      const currentPaths = guide.documentPaths || [];
      const updatedPaths = currentPaths.filter(path => !path.includes(documentPath));
      
      await storage.updateBrandStylesheet(guide.id, {
        documentPaths: updatedPaths
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error removing document from grounding guide:", error);
      res.status(500).json({ error: "Failed to remove document" });
    }
  });

  // Email Optimizer Routes
  app.post("/api/email-optimizer/generate", authenticateToken, async (req: any, res) => {
    try {
      const { contentType, campaignContext, targetAudience, mainGoal, existingText } = req.body;
      
      if (!contentType || !campaignContext || !targetAudience || !mainGoal) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Get user's grounding guides for context
      const user = await storage.getUser(req.user.userId);
      if (!user || !user.newsroomId) {
        return res.status(401).json({ error: "User not found" });
      }
      const stylesheets = await storage.getBrandStylesheetsByNewsroom(user.newsroomId);
      const defaultStylesheet = stylesheets.find(s => s.isDefault) || stylesheets[0];

      const contentTypeMap: Record<string, string> = {
        subject_line: "subject lines",
        preheader: "preheader text", 
        button_text: "button text"
      };

      const prompt = `You are an expert email marketing strategist specializing in nonprofit local news. Your task is to generate 5 highly optimized ${contentTypeMap[contentType]} options.

CAMPAIGN CONTEXT:
${campaignContext}

TARGET AUDIENCE: ${targetAudience}
MAIN GOAL: ${mainGoal}
${existingText ? `CURRENT TEXT: ${existingText}` : ''}

BRAND GUIDELINES:
${defaultStylesheet ? `
- Tone: ${defaultStylesheet.tone}
- Voice: ${defaultStylesheet.voice}
- Key Messages: ${defaultStylesheet.keyMessages?.join(', ') || 'N/A'}
- Guidelines: ${defaultStylesheet.guidelines || 'N/A'}
` : 'Use professional, community-focused tone'}

Generate 5 ${contentTypeMap[contentType]} options optimized for nonprofit local news. For each option, provide:
1. The text
2. A brief explanation of the strategy
3. A performance score (1-100) based on email marketing best practices
4. A category (e.g., "Urgency", "Curiosity", "Community Impact", "Direct Benefit")

${contentType === 'subject_line' ? `
SUBJECT LINE REQUIREMENTS:
- Keep under 50 characters
- Create urgency without clickbait
- Include local relevance when possible
- Avoid spam trigger words
- Focus on community impact
` : ''}

${contentType === 'preheader' ? `
PREHEADER REQUIREMENTS:
- 90-130 characters optimal
- Complement the subject line, don't repeat it
- Provide additional context or hook
- End with compelling reason to open
` : ''}

${contentType === 'button_text' ? `
BUTTON TEXT REQUIREMENTS:
- 2-5 words maximum
- Use action-oriented verbs
- Be specific about the outcome
- Create sense of value or urgency
` : ''}

Return JSON format:
{
  "options": [
    {
      "text": "example text",
      "reasoning": "explanation of strategy",
      "score": 85,
      "category": "category name"
    }
  ]
}`;

      console.log("Generating email content with prompt:", prompt.substring(0, 200) + "...");

      const aiResponse = await aiProviderService.generateContent(prompt, "claude-sonnet-4-20250514");
      
      let options;
      try {
        // Try to parse the AI response as JSON
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResponse = JSON.parse(jsonMatch[0]);
          options = parsedResponse.options || [];
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        console.error("Failed to parse AI response as JSON, creating fallback options");
        // Create fallback options based on content type
        options = createFallbackOptions(contentType, campaignContext, targetAudience, mainGoal);
      }

      res.json({ options });
    } catch (error) {
      console.error("Error generating email content:", error);
      res.status(500).json({ error: "Failed to generate content" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Fallback function for email content generation
function createFallbackOptions(contentType: string, context: string, audience: string, goal: string) {
  const baseOptions: Record<string, Array<{text: string, reasoning: string, score: number, category: string}>> = {
    subject_line: [
      { text: "Breaking: Local News Update", reasoning: "Creates urgency with 'Breaking' and emphasizes local relevance", score: 82, category: "Urgency" },
      { text: "Your Community Needs This Info", reasoning: "Direct appeal to community responsibility and personal relevance", score: 79, category: "Community Impact" },
      { text: "Important Updates Inside", reasoning: "Simple, direct approach that promises valuable content", score: 75, category: "Direct Benefit" },
      { text: "What's Happening in Your Area", reasoning: "Personal and local focus that creates curiosity", score: 78, category: "Curiosity" },
      { text: "Don't Miss This Local Story", reasoning: "Combines urgency with local relevance and FOMO", score: 80, category: "Urgency" }
    ],
    preheader: [
      { text: "Get the latest updates that directly impact your daily life and community decisions", reasoning: "Emphasizes personal relevance and community impact", score: 85, category: "Personal Relevance" },
      { text: "Local reporting you can trust - stories that matter to your neighborhood", reasoning: "Builds trust and emphasizes local focus", score: 83, category: "Trust Building" },
      { text: "Breaking developments in your area - stay informed about changes affecting you", reasoning: "Creates urgency while promising relevant information", score: 81, category: "Urgency" },
      { text: "Independent journalism serving your community - read the full story inside", reasoning: "Emphasizes mission and calls for action", score: 79, category: "Mission Driven" },
      { text: "Your voice matters - see how local decisions impact your family and future", reasoning: "Empowers reader and creates personal connection", score: 82, category: "Empowerment" }
    ],
    button_text: [
      { text: "Read Full Story", reasoning: "Clear, direct action that promises complete information", score: 85, category: "Direct Action" },
      { text: "Learn More", reasoning: "Simple, non-threatening call to action", score: 78, category: "Educational" },
      { text: "Get Details", reasoning: "Promises specific information, creates value", score: 80, category: "Information" },
      { text: "See Impact", reasoning: "Emphasizes consequences and relevance", score: 82, category: "Relevance" },
      { text: "Join Community", reasoning: "Builds sense of belonging and engagement", score: 79, category: "Community" }
    ]
  };

  return baseOptions[contentType] || [];
}
