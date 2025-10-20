import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { cleanupOldLogs } from "./storage";
import { seedPrompts } from "./data/seed-prompts";
import { db } from "./db";
import { prompts } from "@shared/schema";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Log the full error for debugging
    console.error('Error details:', {
      status,
      message,
      stack: err.stack,
      error: err
    });

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });

  // Run log cleanup on startup
  cleanupOldLogs().catch((err: any) => log(`Log cleanup error: ${err.message}`));

  // Schedule daily log cleanup (runs every 24 hours)
  setInterval(() => {
    cleanupOldLogs().catch((err: any) => log(`Scheduled log cleanup error: ${err.message}`));
  }, 24 * 60 * 60 * 1000);

  // Seed AI prompts if they don't exist
  try {
    const existingPrompts = await db.select().from(prompts).limit(1);
    if (existingPrompts.length === 0) {
      log('🌱 No prompts found, seeding prompts...');
      await seedPrompts();
      log('✅ Prompts seeded successfully');
    } else {
      log('✓ Prompts already exist, skipping seed');
    }
  } catch (error: any) {
    log(`⚠️ Prompt seeding check error: ${error.message}`);
  }

  // Auto-migrate old prompt keys to new keys
  try {
    const { eq } = await import('drizzle-orm');
    
    // Update campaign_generation_main -> campaign_generate
    const updated1 = await db
      .update(prompts)
      .set({ promptKey: 'campaign_generate' })
      .where(eq(prompts.promptKey, 'campaign_generation_main'))
      .returning();
    
    // Update draft_merge_main -> draft_merge
    const updated2 = await db
      .update(prompts)
      .set({ promptKey: 'draft_merge' })
      .where(eq(prompts.promptKey, 'draft_merge_main'))
      .returning();
    
    if (updated1.length > 0 || updated2.length > 0) {
      log(`✅ Migrated ${updated1.length + updated2.length} prompt keys to new format`);
    }
  } catch (error: any) {
    log(`⚠️ Prompt migration error: ${error.message}`);
  }
  } catch (error: any) {
    console.error('❌ Fatal server startup error:', error);
    log(`❌ Server failed to start: ${error.message}`);
    process.exit(1);
  }
})();
