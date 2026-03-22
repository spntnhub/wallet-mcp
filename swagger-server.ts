import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { advancedRateLimit } from './rate-limit.js';

const app = express();
app.use(advancedRateLimit());
const openapiPath = path.resolve(__dirname, './openapi.yaml');
const openapiSpec = fs.readFileSync(openapiPath, 'utf-8');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(JSON.parse(JSON.stringify(require('js-yaml').load(openapiSpec)))));

// Dummy manifest endpoint (eksik fonksiyonlar için geçici çözüm)
import { Request, Response } from "express";
export function manifestEndpoint(req: Request, res: Response) {
  res.json({ name: "Wallet MCP Server", version: "1.0.0" });
}

export function chainsEndpoint(req: Request, res: Response) {
  res.json({ chains: Object.keys(require('./constants.js').SUPPORTED_CHAINS) });
}

export default app;
