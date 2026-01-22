import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  // We prioritize the 'public' folder at the root
  const possiblePaths = [
    path.resolve(process.cwd(), "public"),
    path.resolve(process.cwd(), "dist/public"),
    path.resolve(__dirname, "../public"),
  ];

  let distPath = possiblePaths[0];
  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, "index.html"))) {
      distPath = p;
      break;
    }
  }

  console.log(`[static] serving from: ${distPath}`);

  app.use(express.static(distPath));

  app.get(/^(?!\/api).+/, (req, res, next) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });

  app.get("/", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Front-end files not found. Please check your Render Build Command.");
    }
  });
}
