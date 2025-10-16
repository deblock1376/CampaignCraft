import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const cspDevPlugin = () => ({
  name: 'csp-dev-headers',
  configureServer(server: any) {
    server.middlewares.use((_req: any, res: any, next: any) => {
      res.setHeader(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "connect-src 'self' ws: wss: https:",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data:",
        ].join('; ')
      );
      next();
    });
  }
});

export default defineConfig({
  plugins: [
    react(),
    // Only use runtime error overlay in development
    ...(process.env.NODE_ENV !== "production" ? [runtimeErrorOverlay()] : []),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
    // Add CSP headers in development for HMR and file uploads
    ...(process.env.NODE_ENV !== "production" ? [cspDevPlugin()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // CSP-compliant production builds
    sourcemap: false, // Disable source maps to prevent eval usage
    minify: 'esbuild', // Use esbuild for minification (no eval)
    target: 'es2020', // Modern target with BigInt support, no eval
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
