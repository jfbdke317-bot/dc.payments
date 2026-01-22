import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
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

  // EXPRESS 5 FIX: Use a regex instead of a string '*' to avoid the PathError crash
  app.get(/^(?!\/api).*/, (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Dashboard not found.");
    }
  });
}
