import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  // Find the public folder safely
  const possiblePaths = [
    path.resolve(__dirname, "../public"),
    path.resolve(__dirname, "../../public"),
    path.resolve(process.cwd(), "public"),
    path.resolve(process.cwd(), "dist/public")
  ];

  let distPath = possiblePaths[0];
  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, "index.html"))) {
      distPath = p;
      break;
    }
  }

  app.use(express.static(distPath));

  // BYPASS EXPRESS 5 ERROR: This middleware handles the dashboard without using any crash-prone symbols
  app.use((req, res, next) => {
    // Only handle GET requests that aren't for the API
    if (req.method !== "GET" || req.path.startsWith("/api")) {
      return next();
    }

    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });
}
