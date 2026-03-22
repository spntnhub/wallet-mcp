// src/tools/balance.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ethers } from "ethers";
import { z } from "zod";
import {
  getProvider,
  getChainConfig,
  isValidAddress,
  formatTokenAmount,
} from "./chain.js";
import cache from "./cache.js";
import { resolveTokenAddress } from "./token-utils.js";
import { aiErrorResponse } from "./ai-error.js";
import { ERC20_ABI, SUPPORTED_CHAINS } from "./constants.js";

const GetBalanceSchema = z.object({
  wallet: z
    .string()
    .describe("EVM wallet address (0x...) to check balance for"),
  chain: z
    .enum(["ethereum", "polygon", "base"])
    .default("polygon")
    .describe("Blockchain network: ethereum, polygon, or base"),
  token: z
    .string()
    .optional()
    .describe(
      "Token symbol (USDC, USDT, WETH etc.) or ERC-20 contract address. Leave empty for native token (ETH/POL)"
    ),
});

type GetBalanceInput = z.infer<typeof GetBalanceSchema>;

export function registerBalanceTool(server: McpServer): void {
  server.registerTool(
    "wallet_get_balance",
    {
      title: "Get Wallet Balance",
      description: `Get the token balance of any EVM wallet address on Ethereum, Polygon, or Base.

Supports native tokens (ETH, POL) and any ERC-20 token by symbol or contract address.

Args:
  - wallet (string): EVM wallet address starting with 0x
  - chain (string): Network — 'ethereum', 'polygon', or 'base' (default: 'polygon')
  - token (string, optional): Token symbol like 'USDC', 'USDT', or a contract address. Leave empty for native token.

Returns:
  {
    "wallet": string,       // The queried address
    "chain": string,        // Network name
    "token": string,        // Token symbol
    "balance": string,      // Human-readable balance (e.g. "12.5 USDC")
    "balanceRaw": string,   // Raw balance in wei/smallest unit
    "decimals": number      // Token decimals
  }

Examples:
  - "What is my POL balance?" → { "wallet": "0x...", "chain": "polygon" }
  - "Check USDC balance on Base" → { "wallet": "0x...", "chain": "base", "token": "USDC" }
  - "Show all my balances across all chains" → { "wallet": "0x..." }
  - "AI chaining: Send 5 USDC from 0xA to 0xB on Polygon, ardından bakiyemi kontrol et." → [ { "step": "prepare_transfer", ... }, { "step": "get_balance", ... } ]
  - Hatalı prompt: "Check BTC balance on Polygon" → { "error": "TOKEN_NOT_FOUND", ... }
  - "ETH balance on mainnet" → chain: ethereum, no token`,
      inputSchema: GetBalanceSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: GetBalanceInput) => {
      if (!isValidAddress(params.wallet)) {
        return {
          content: [{
            type: "text",
            text: `Invalid wallet address: ${params.wallet}. Must be a valid EVM address starting with 0x.`,
            annotations: undefined,
            _meta: undefined
          }],
        };
      }

      try {
        const provider = getProvider(params.chain as keyof typeof SUPPORTED_CHAINS);
        const chainConfig = getChainConfig(params.chain as keyof typeof SUPPORTED_CHAINS);

        // Native token balance
        if (!params.token) {
          const cacheKey = `balance:${params.chain}:${params.wallet}:native`;
          let balanceWei: bigint;
          const cached = cache.get(cacheKey);
          if (cached === undefined) {
            balanceWei = await provider.getBalance(params.wallet);
            cache.set(cacheKey, balanceWei);
          } else if (typeof cached === "bigint") {
            balanceWei = cached;
          } else if (typeof cached === "string" && /^\d+$/.test(cached)) {
            balanceWei = BigInt(cached);
          } else {
            throw new Error("Invalid cached balanceWei type");
          }
          const result = {
            wallet: params.wallet,
            chain: chainConfig.name,
            token: chainConfig.nativeToken,
            balance: formatTokenAmount(balanceWei, 18, chainConfig.nativeToken),
            balanceRaw: balanceWei.toString(),
            decimals: 18,
          };
          return {
            content: [{
              type: "text",
              text: JSON.stringify(result, null, 2),
              annotations: undefined,
              _meta: undefined
            }],
            structuredContent: result,
          };
        }

        // ERC-20 token — resolve address
        const { address: tokenAddress, error } = resolveTokenAddress(params.chain as keyof typeof SUPPORTED_CHAINS, params.token);
        if (error || !tokenAddress) {
          return {
            content: [{
              type: "text",
              text: error || "Token address not found",
              annotations: undefined,
              _meta: undefined
            }],
          };
        }

        const cacheKey = `balance:${params.chain}:${params.wallet}:${tokenAddress}`;
        let balance: bigint | string | undefined = cache.get(cacheKey);
        let decimals: number, symbol: string;
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        if (balance === undefined) {
          [balance, decimals, symbol] = await Promise.all([
            contract.balanceOf(params.wallet) as Promise<bigint>,
            contract.decimals() as Promise<number>,
            contract.symbol() as Promise<string>,
          ]);
          cache.set(cacheKey, balance);
        } else if (typeof balance === "bigint") {
          [decimals, symbol] = await Promise.all([
            contract.decimals() as Promise<number>,
            contract.symbol() as Promise<string>,
          ]);
        } else if (typeof balance === "string" && /^\d+$/.test(balance)) {
          balance = BigInt(balance);
          [decimals, symbol] = await Promise.all([
            contract.decimals() as Promise<number>,
            contract.symbol() as Promise<string>,
          ]);
        } else {
          throw new Error("Invalid cached balance type");
        }
        const result = {
          wallet: params.wallet,
          chain: chainConfig.name,
          token: symbol,
          tokenAddress,
          balance: formatTokenAmount(balance as bigint, decimals, symbol),
          balanceRaw: (balance as bigint).toString(),
          decimals,
        };
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
            annotations: undefined,
            _meta: undefined
          }],
          structuredContent: result,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return {
          content: [{
            type: "text",
            text: `Error fetching balance: ${message}`,
            annotations: undefined,
            _meta: undefined
          }],
        };
      }
    }
  );
}

// Tüm zincirlerdeki bakiyeleri getir
const GetAllBalancesSchema = z.object({
  wallet: z
    .string()
    .describe("EVM wallet address to check across all supported chains"),
  token: z
    .string()
    .optional()
    .describe(
      "Token symbol (USDC, USDT) to check across chains. Leave empty for native tokens."
    ),
});

type GetAllBalancesInput = z.infer<typeof GetAllBalancesSchema>;

export function registerAllBalancesTool(server: McpServer): void {
  server.registerTool(
    "wallet_get_all_balances",
    {
      title: "Get Balances Across All Chains",
      description: `Get wallet balances across all supported chains (Ethereum, Polygon, Base) in one call.

Useful for getting a complete picture of a wallet's holdings.

Args:
  - wallet (string): EVM wallet address starting with 0x
  - token (string, optional): Token symbol like 'USDC' to check across all chains. Leave empty for native tokens.

Returns:
  Array of balance results per chain, each with wallet, chain, token, balance, balanceRaw, decimals.

Examples:
  - "Show all my balances" → wallet: 0x..., no token
  - "How much USDC do I have across all chains?" → wallet: 0x..., token: USDC`,
      inputSchema: GetAllBalancesSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params: GetAllBalancesInput) => {
      if (!isValidAddress(params.wallet)) {
        return {
          content: [
            {
              type: "text",
              text: `Error: Invalid wallet address "${params.wallet}".`,
            },
          ],
        };
      }

      const chains = Object.keys(SUPPORTED_CHAINS) as Array<keyof typeof SUPPORTED_CHAINS>;
      const results: unknown[] = [];
      const errors: string[] = [];

      await Promise.allSettled(
        chains.map(async (chain) => {
          try {
            const provider = getProvider(chain);
            const chainConfig = getChainConfig(chain);

            if (!params.token) {
              let balanceWei = await provider.getBalance(params.wallet);
              if (typeof balanceWei !== "bigint") {
                balanceWei = BigInt(balanceWei);
              }
              results.push({
                chain: chainConfig.name,
                token: chainConfig.nativeToken,
                balance: formatTokenAmount(
                  balanceWei,
                  18,
                  chainConfig.nativeToken
                ),
                balanceRaw: balanceWei.toString(),
              });
            } else {
              const chainTokens = chainConfig.tokens as Record<string, string>;
              const tokenAddress = chainTokens[params.token.toUpperCase()];
              if (!tokenAddress) return; // bu zincirde token yok, atla

              const contract = new ethers.Contract(
                tokenAddress,
                ERC20_ABI,
                provider
              );
              let [balance, decimals, symbol] = await Promise.all([
                contract.balanceOf(params.wallet) as Promise<bigint>,
                contract.decimals() as Promise<number>,
                contract.symbol() as Promise<string>,
              ]);
              if (typeof balance !== "bigint") {
                balance = BigInt(balance);
              }
              results.push({
                chain: chainConfig.name,
                token: symbol,
                balance: formatTokenAmount(balance, decimals, symbol),
                balanceRaw: balance.toString(),
              });
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown";
            errors.push(`${String(chain)}: ${message}`);
          }
        })
      );

      const output = {
        wallet: params.wallet,
        balances: results,
        ...(errors.length > 0 ? { errors } : {}),
      };

      return {
        content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
        structuredContent: output,
      };
    }
  );
}
