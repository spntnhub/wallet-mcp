<p align="center">
	<img src="https://img.shields.io/npm/v/@spntn/wallet-mcp.svg?style=flat-square" alt="npm version" />
	<img src="https://img.shields.io/github/license/spntn/wallet-mcp-server?style=flat-square" alt="license" />
	<img src="https://img.shields.io/node/v/ts-node?style=flat-square" alt="node version" />
</p>


# @spntn/wallet-mcp

---

## 📝 Changelog (v1.1.0)

- AI/UX-first API, tool discovery, chaining, simulation endpoints
- Advanced rate limiting, quota, abuse detection, Prometheus metrics
- WebSocket, Redis, admin API, live Swagger/OpenAPI
- Context-rich error handling, sample client, production security

---

## 🧑‍🔬 Minimum Requirements

- Node.js >= 18
- npm >= 9
- Linux/macOS/Windows

---

## 🧪 Test & Example Usage

```bash
# Run tests
npm test
# or
npx vitest

# Sample client
node client-example.js
```

---

## 🤝 Contributing & Support

- Please open an issue or send a PR for contributions.
- For questions, use GitHub Issues or contact via [spntn.io](https://spntn.io).

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
- **Base Mainnet**


# @spntn/wallet-mcp

MCP server for EVM wallet operations — AI/UX-first, modular, and production-ready. Supports balance queries, transfer preparation, gas estimation, transaction tracking, and more across Ethereum, Polygon, and Base.

---


## 🗺️ Overview

- **Multi-chain**: Ethereum, Polygon, Base
- **Modular tools**: Balance, transfer, gas, transaction, token, admin, WebSocket, Prometheus, AI chaining, simulation
- **AI/UX-first**: Natural language prompts, AI-friendly error handling, tool discovery, chaining, sample client
- **Production features**: Rate limit, quota, Prometheus, Redis, OpenAPI/Swagger, test/simulation endpoints

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

"Send 5 USDC from 0xA to 0xB on Polygon, then check my balance."
// → [ { "step": "prepare_transfer", ... }, { "step": "get_balance", ... } ]

"Send 1000 BTC to 0xC on Polygon"
// → { "error": "TOKEN_NOT_FOUND", "message": "BTC is not supported on Polygon" }
```

---


## 🛡️ Security & Production

- **No private keys**: Only unsigned tx, user signs
- **Rate limit & quota**: API key or IP-based, Prometheus monitoring
- **Test/simulation**: /api/sim/* endpoints for AI and client testing
- **OpenAPI/Swagger**: Live documentation `/docs`
- **Prometheus**: `/metrics` for API usage, abuse, quota metrics
- **WebSocket**: Real-time chain and tx events

---


## ⚙️ Configuration

| Variable | Required | Description |
|---|---|---|
| `FEE_WALLET` | ✅ | Your wallet address to receive 0.2% platform fees |
| `POLYGON_RPC_URL` | ❌ | Custom Polygon RPC (default: llamarpc) |
| `ETH_RPC_URL` | ❌ | Custom Ethereum RPC (default: llamarpc) |
| `BASE_RPC_URL` | ❌ | Custom Base RPC (default: mainnet.base.org) |
| `ADMIN_API_KEY` | ❌ | API key for admin endpoints |
| `REDIS_URL` | ❌ | Redis cache connection |

---


## 📖 OpenAPI/Swagger

- Live documentation: [http://localhost:8080/docs](http://localhost:8080/docs)
- OpenAPI file: `openapi.yaml`

---


## 🧪 Test & Simulation

- `/api/sim/test` — Counter test endpoint
- `/api/sim/error?type=rate|quota` — Error simulation
- `/api/sim/chain` — Tool chaining simulation (POST: `{ steps: [...] }`)

---


## 🔗 Public API Access & Usage

### Live Railway Endpoint

All API endpoints are accessible via the Railway-provided domain:

```
https://spntnwallet-mcp-production.up.railway.app/
```

> You can find your project’s domain in the Railway dashboard.

### Live Example Requests

```bash
# Health check
curl https://spntnwallet-mcp-production.up.railway.app/

# Balance query (example GET)
curl "https://spntnwallet-mcp-production.up.railway.app/wallet/balance?wallet=0x123...&chain=polygon&token=USDC"

# All balances across chains
curl "https://spntnwallet-mcp-production.up.railway.app/wallet/all-balances?wallet=0x123..."

# Swagger/OpenAPI documentation
https://spntnwallet-mcp-production.up.railway.app/docs
```

### Postman Testing
- You can test endpoints in Postman using the Railway domain.
- Import the Swagger/OpenAPI documentation into Postman for easy testing.

### CORS & AI Agents
- The API is accessible by AI agents and frontend applications directly.
- CORS policy is open (can be customized if needed).

---

## 🌍 How to Share & Publish

- Share your Railway domain or custom domain to make the API public.
- Provide the Swagger/OpenAPI endpoint as documentation for developers and AI agents.
- If you want to add API keys or rate limiting, you can easily do so with Express middleware.

---

## 🏷️ License

MIT
