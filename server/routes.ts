import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiProviderService } from "./services/ai-providers";
import { insertBrandStylesheetSchema, insertCampaignSchema, insertCampaignTemplateSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
  app.get("/api/newsrooms/:newsroomId/campaigns", async (req, res) => {
    try {
      const newsroomId = parseInt(req.params.newsroomId);
      const campaigns = await storage.getCampaignsByNewsroom(newsroomId);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
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

  app.post("/api/newsrooms/:newsroomId/campaigns", async (req, res) => {
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

  app.put("/api/campaigns/:id", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
