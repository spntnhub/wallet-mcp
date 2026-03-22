import rateLimit from 'express-rate-limit';
import client from 'prom-client';

// Prometheus usage metric
export const apiUsageCounter = new client.Counter({
  name: 'api_usage_total',
  help: 'API usage count by key or IP',
  labelNames: ['user']
});

// Gelişmiş rate limit: API key veya IP bazlı
export function advancedRateLimit() {
  return rateLimit({
    windowMs: 60 * 1000, // 1 dakika
    max: 30, // 1 dakikada 30 istek
    keyGenerator: (req: any): string => {
      // API key varsa ona göre, yoksa IP
      const key = req.headers['x-api-key']?.toString() || req.ip;
      return key || '';
    },
    handler: (req: any, res: any) => {
      res.status(429).json({
        error: true,
        code: 'RATE_LIMIT',
        message: 'Too many requests, please try again later.',
        suggestion: 'Daha az sıklıkta istek atın veya API key kullanın.'
      });
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: any) => {
      // Prometheus/metrics endpoint rate limitlenmesin
      return req.path.startsWith('/metrics');
    }
  });
}
