import express from 'express';
import swaggerApp from './swagger-server.js';
import prometheusApp from './prometheus-server.js';
import simApp from './sim-server.js';

const app = express();

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'wallet-mcp-server alive' });
});

// API ve dokümantasyon
app.use(swaggerApp);
// Prometheus metrikleri
app.use(prometheusApp);
// Simülasyon/test endpointleri
app.use(simApp);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Express API server running on http://localhost:${PORT}`);
});
