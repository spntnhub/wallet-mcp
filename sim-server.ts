import express from 'express';
// Basit test/simülasyon endpoint'i: AI ve istemci testleri için
const app = express();

// Tool chaining simülasyonu: zincirli istek örneği
app.post('/api/sim/chain', express.json(), (req, res) => {
  // Örnek: ardışık iki tool çağrısı simülasyonu
  const { steps } = req.body;
  if (!Array.isArray(steps) || steps.length === 0) {
    return res.status(400).json({ error: true, code: 'INVALID_INPUT', message: 'steps array required' });
  }
  // Basit örnek: her adımı "executed" olarak döndür
  const results = steps.map((step, i) => ({
    step: i + 1,
    tool: step.tool,
    input: step.input,
    result: { status: 'executed', echo: step.input }
  }));
  res.json({ chain: results });
});

// Döngüsel test: Her istekte bir sayaç artar ve yanıt döner
let testCounter = 0;
app.get('/api/sim/test', (req, res) => {
  testCounter++;
  res.json({
    testCounter,
    message: 'Simülasyon test endpoint yanıtı',
    now: new Date().toISOString()
  });
});

// Hata simülasyonu: Belirli bir parametreyle hata döndür
app.get('/api/sim/error', (req, res) => {
  const { type } = req.query;
  if (type === 'rate') {
    return res.status(429).json({ error: true, code: 'RATE_LIMIT', message: 'Test rate limit error.' });
  }
  if (type === 'quota') {
    return res.status(403).json({ error: true, code: 'QUOTA_EXCEEDED', message: 'Test quota exceeded.' });
  }
  res.status(400).json({ error: true, code: 'TEST_ERROR', message: 'Generic test error.' });
});

export default app;
