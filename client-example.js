// Basit bir örnek istemci kodu (Node.js, fetch ile)
const fetch = require('node-fetch');

async function getChains() {
  const res = await fetch('http://localhost:3000/api/chains');
  const data = await res.json();
  console.log('Supported chains:', data);
}

async function addToken(chainKey, symbol, address) {
  const res = await fetch('http://localhost:3000/api/admin/add-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chainKey, tokenSymbol: symbol, tokenAddress: address })
  });
  const data = await res.json();
  console.log('Add token result:', data);
}

getChains();
// addToken('ethereum', 'DAI', '0x6B175474E89094C44Da98b954EedeAC495271d0F');
