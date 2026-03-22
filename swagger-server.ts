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

// Tool discovery manifest endpoint
app.get('/api/manifest', manifestEndpoint);
// Zincir discovery endpoint
app.get('/api/chains', chainsEndpoint);

export default app;
