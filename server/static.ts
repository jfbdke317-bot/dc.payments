import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  // Use the root public directory created by the build script
  const distPath = path.resolve(__dirname, "../public");

  if (!fs.existsSync(distPath)) {
    console.warn(`Static directory not found at ${distPath}. Dashboard might not load.`);
  }

  app.use(express.static(distPath));

  // Express 5 requires specific handling for wildcard routes
  app.get("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Dashboard not found. Please check your build logs.");
    }
  });
}
