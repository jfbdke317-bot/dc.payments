import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  // In production, the public files are one level up from the server folder
  const distPath = path.resolve(__dirname, "../public");
  
  if (!fs.existsSync(distPath)) {
    console.warn(`Static directory not found at ${distPath}. Dashboard might not load.`);
  }

  app.use(express.static(distPath));

  // Support client-side routing by serving index.html for all unknown routes
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Dashboard not found. Please check your build logs.");
    }
  });
}
