import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { aiProviderService } from "./services/ai-providers";
import { insertBrandStylesheetSchema, insertCampaignSchema, insertCampaignTemplateSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

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
      return res.status(403).json({ error: 'Invalid token' });
    }
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

  const httpServer = createServer(app);
  return httpServer;
}
