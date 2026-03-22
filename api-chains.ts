import { SUPPORTED_CHAINS } from "./constants.js";
import { NextFunction, Request, Response } from "express";

// Tool manifest (AI discovery)
export function manifestEndpoint(req: Request, res: Response, next: NextFunction) {
  res.json({
    tools: [
      {
        name: "wallet_get_balance",
        description: "Get native or ERC-20 token balance for any wallet",
        input: {
          wallet: "EVM address (0x...)",
          chain: "ethereum | polygon | base",
          token: "optional, symbol or address"
        }
      },
      {
        name: "wallet_get_all_balances",
        description: "Get balances across all supported chains at once",
        input: {
          wallet: "EVM address (0x...)",
          token: "optional, symbol"
        }
      },
      {
        name: "wallet_prepare_transfer",
        description: "Prepare a transfer transaction (unsigned) for user to sign",
        input: {
          from: "EVM address",
          to: "EVM address",
          amount: "string",
          chain: "ethereum | polygon | base",
          token: "optional, symbol"
        }
      },
      {
        name: "wallet_get_gas_price",
        description: "Get current gas price on any supported chain",
        input: {
          chain: "ethereum | polygon | base"
        }
      },
      {
        name: "wallet_get_transaction",
        description: "Check status and details of any transaction",
        input: {
          txHash: "string",
          chain: "ethereum | polygon | base"
        }
      }
    ]
  });
}

// Express endpoint: /api/chains
export function chainsEndpoint(req: Request, res: Response, next: NextFunction) {
  // Tüm zincir ve token listesini AI-friendly olarak döndür
  res.json({
    chains: SUPPORTED_CHAINS
  });
}
