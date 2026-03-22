
<p align="center">
	<img src="https://img.shields.io/npm/v/@spntn/wallet-mcp.svg?style=flat-square" alt="npm version" />
	<img src="https://img.shields.io/github/license/spntn/wallet-mcp-server?style=flat-square" alt="license" />
	<img src="https://img.shields.io/node/v/ts-node?style=flat-square" alt="node version" />
</p>

# @spntn/wallet-mcp
---

## 📝 Changelog (v1.1.0)

- AI/UX-first API, tool discovery, chaining, simülasyon endpoint’leri
- Gelişmiş rate limit, quota, abuse detection, Prometheus metrikleri
- WebSocket, Redis, admin API, canlı Swagger/OpenAPI
- Context-rich hata yönetimi, örnek istemci, production güvenlik

---
---

## 🧑‍🔬 Minimum Requirements

- Node.js >= 18
- npm >= 9
- Linux/macOS/Windows

---
---

## 🧪 Test & Example Usage

```bash
# Testleri çalıştır
npm test
# veya
npx vitest

# Örnek istemci
node client-example.js
```

---
---

## 🤝 Contributing & Support

- PR ve katkılar için lütfen issue açın veya doğrudan PR gönderin.
- Sorularınız için GitHub Issues veya [spntn.io](https://spntn.io) üzerinden iletişime geçebilirsiniz.

---

MCP server for EVM wallet operations — balance queries, transfer preparation, gas estimation, and transaction tracking across Ethereum, Polygon, and Base.

## Tools

| Tool | Description |
|---|---|
| `wallet_get_balance` | Get native or ERC-20 token balance for any wallet |
| `wallet_get_all_balances` | Get balances across all supported chains at once |
| `wallet_prepare_transfer` | Prepare a transfer transaction (unsigned) for user to sign |
| `wallet_get_gas_price` | Get current gas price on any supported chain |
| `wallet_get_transaction` | Check status and details of any transaction |

## Supported Chains

- **Ethereum Mainnet** (ETH, USDC, USDT, WETH)
- **Polygon Mainnet** (POL, USDC, USDT, WMATIC)

# @spntn/wallet-mcp

MCP server for EVM wallet operations — AI/UX-first, modular, and production-ready. Supports balance queries, transfer preparation, gas estimation, transaction tracking, and more across Ethereum, Polygon, and Base.

---

## 🗺️ Overview

- **Multi-chain**: Ethereum, Polygon, Base
- **Modular tools**: Balance, transfer, gas, transaction, token, admin, WebSocket, Prometheus, AI chaining, simülasyon
- **AI/UX-first**: Doğal dil promptları, AI-friendly hata yönetimi, tool discovery, chaining, örnek istemci
- **Production features**: Rate limit, quota, Prometheus, Redis, OpenAPI/Swagger, test/simülasyon endpoint’leri

---

## 🚀 Quick Start

```bash
# One-time run
FEE_WALLET=0xYOUR_WALLET npx @spntn/wallet-mcp

# Or start API server (Express)
npx ts-node api-server.ts
```

---

## 🔗 API Endpoints & Tools

| Endpoint | Tool | Description |
|---|---|---|
| `/wallet/balance` | `wallet_get_balance` | Get native/ERC-20 token balance |
| `/wallet/all-balances` | `wallet_get_all_balances` | Get balances across all chains |
| `/wallet/transfer` | `wallet_prepare_transfer` | Prepare unsigned transfer |
| `/wallet/gas` | `wallet_get_gas_price` | Get current gas price |
| `/wallet/transaction` | `wallet_get_transaction` | Check transaction status |
| `/api/manifest` | Tool Discovery | List all available tools (AI/UX) |
| `/api/chains` | Chain Discovery | List supported chains/tokens |
| `/metrics` | Prometheus | API usage & quota metrics |
| `/ws` | WebSocket | Real-time events (block, tx, etc.) |
| `/api/sim/test` | Simülasyon | Test endpoint (counter) |
| `/api/sim/error` | Simülasyon | Error simulation (rate, quota, etc.) |
| `/api/sim/chain` | Tool Chaining | Simulate chained tool calls |

---

## 🧑‍💻 Example Prompts & Chaining

```text
"What is my USDC balance on Polygon? Wallet: 0x123..."
// → { "wallet": "0x123...", "chain": "polygon", "token": "USDC", ... }

"Show all my balances across all chains for 0xabc..."
// → [ { "chain": "ethereum", ... }, { "chain": "polygon", ... } ]

"Prepare a transfer of 10 USDC to 0x456... on Base"
// → { "from": "0x...", "to": "0x456...", "amount": "10", "chain": "base", "token": "USDC", ... }

"Send 5 USDC from 0xA to 0xB on Polygon, ardından bakiyemi kontrol et."
// → [ { "step": "prepare_transfer", ... }, { "step": "get_balance", ... } ]

"Send 1000 BTC to 0xC on Polygon"
// → { "error": "TOKEN_NOT_FOUND", "message": "BTC is not supported on Polygon" }
```

---

## 🛡️ Security & Production

- **No private keys**: Only unsigned tx, user signs
- **Rate limit & quota**: API key veya IP bazlı, Prometheus ile izlenebilir
- **Test/simülasyon**: /api/sim/* endpoint’leri ile AI ve istemci testleri
- **OpenAPI/Swagger**: Canlı dokümantasyon `/docs`
- **Prometheus**: `/metrics` ile API usage, abuse, quota metrikleri
- **WebSocket**: Gerçek zamanlı zincir ve tx event’leri

---

## ⚙️ Configuration

| Variable | Required | Description |
|---|---|---|
| `FEE_WALLET` | ✅ | Your wallet address to receive 0.2% platform fees |
| `POLYGON_RPC_URL` | ❌ | Custom Polygon RPC (default: llamarpc) |
| `ETH_RPC_URL` | ❌ | Custom Ethereum RPC (default: llamarpc) |
| `BASE_RPC_URL` | ❌ | Custom Base RPC (default: mainnet.base.org) |
| `ADMIN_API_KEY` | ❌ | Admin endpoints için API key |
| `REDIS_URL` | ❌ | Redis cache için bağlantı |

---

## 📖 OpenAPI/Swagger

- Canlı dokümantasyon: [http://localhost:3000/docs](http://localhost:3000/docs)
- OpenAPI dosyası: `openapi.yaml`

---

## 🧪 Test & Simülasyon

- `/api/sim/test` — Sayaç döndüren test endpoint’i
- `/api/sim/error?type=rate|quota` — Hata simülasyonu
- `/api/sim/chain` — Tool chaining simülasyonu (POST: `{ steps: [...] }`)

---

## 🏷️ License

MIT
