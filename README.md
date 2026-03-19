# @spntn/wallet-mcp

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
- **Base Mainnet** (ETH, USDC, WETH)

## Fee Model

A **0.2% platform fee** is included in transfer transactions. The fee is prepared as a separate transaction step — no hidden deductions.

## Quick Start

```bash
# One-time run
FEE_WALLET=0xYOUR_WALLET npx @spntn/wallet-mcp
```

## Configure in Claude Desktop

```json
{
  "mcpServers": {
    "wallet": {
      "command": "npx",
      "args": ["-y", "@spntn/wallet-mcp"],
      "env": {
        "FEE_WALLET": "0xYOUR_WALLET_ADDRESS",
        "POLYGON_RPC_URL": "https://polygon.llamarpc.com",
        "ETH_RPC_URL": "https://eth.llamarpc.com",
        "BASE_RPC_URL": "https://mainnet.base.org"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `FEE_WALLET` | ✅ | Your wallet address to receive 0.2% platform fees |
| `POLYGON_RPC_URL` | ❌ | Custom Polygon RPC (default: llamarpc) |
| `ETH_RPC_URL` | ❌ | Custom Ethereum RPC (default: llamarpc) |
| `BASE_RPC_URL` | ❌ | Custom Base RPC (default: mainnet.base.org) |

## Example Agent Prompts

```
"What is my USDC balance on Polygon? Wallet: 0x..."
"Show all my balances across all chains"
"Prepare a transfer of 10 USDC to 0x... on Base"
"What's the current gas price on Ethereum?"
"Check the status of transaction 0x..."
```

## Security

- This server **never** holds private keys
- Transfer tool prepares unsigned transactions only — user must sign with their own wallet
- RPC calls are read-only for balance/gas queries

## License

MIT
