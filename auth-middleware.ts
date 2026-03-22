import { Request, Response, NextFunction } from "express";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "changeme";

export function requireAdminApiKey(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-api-key"] || req.query.api_key;
  if (key !== ADMIN_API_KEY) {
    return res.status(401).json({ error: true, code: "UNAUTHORIZED", message: "Invalid or missing API key." });
  }
  next();
}
