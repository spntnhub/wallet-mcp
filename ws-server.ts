// Basit WebSocket sunucusu: İşlem durumu ve zincir olayı yayını için temel yapı
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'welcome', message: 'WebSocket bağlantısı kuruldu.' }));

  // Örnek: Her 10 sn'de bir dummy zincir olayı yayını
  const interval = setInterval(() => {
    ws.send(JSON.stringify({
      type: 'chain_event',
      event: 'dummy_block',
      data: { blockNumber: Math.floor(Math.random() * 1000000) }
    }));
  }, 10000);

  ws.on('close', () => clearInterval(interval));
});

export default wss;
