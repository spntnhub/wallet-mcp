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
  - "What is my POL balance?" → chain: polygon, no token
  - "Check USDC balance on Base" → chain: base, token: USDC
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
          content: [
            {
              type: "text",
              text: `Error: Invalid wallet address "${params.wallet}". Must be a valid EVM address starting with 0x.`,
            },
          ],
        };
      }

      try {
        const provider = getProvider(params.chain);
        const chainConfig = getChainConfig(params.chain);

        // Native token balance
        if (!params.token) {
          const balanceWei = await provider.getBalance(params.wallet);
          const result = {
            wallet: params.wallet,
            chain: chainConfig.name,
            token: chainConfig.nativeToken,
            balance: formatTokenAmount(balanceWei, 18, chainConfig.nativeToken),
            balanceRaw: balanceWei.toString(),
            decimals: 18,
          };
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            structuredContent: result,
          };
        }

        // ERC-20 token — resolve address
        let tokenAddress: string;
        const chainTokens = chainConfig.tokens as Record<string, string>;

        if (params.token.startsWith("0x")) {
          tokenAddress = params.token;
        } else {
          const upperToken = params.token.toUpperCase();
          if (!chainTokens[upperToken]) {
            return {
              content: [
                {
                  type: "text",
                  text: `Error: Token "${params.token}" not found on ${chainConfig.name}. Use a contract address or one of: ${Object.keys(chainTokens).join(", ")}`,
                },
              ],
            };
          }
          tokenAddress = chainTokens[upperToken];
        }

        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const [balance, decimals, symbol] = await Promise.all([
          contract.balanceOf(params.wallet) as Promise<bigint>,
          contract.decimals() as Promise<number>,
          contract.symbol() as Promise<string>,
        ]);

        const result = {
          wallet: params.wallet,
          chain: chainConfig.name,
          token: symbol,
          tokenAddress,
          balance: formatTokenAmount(balance, decimals, symbol),
          balanceRaw: balance.toString(),
          decimals,
        };

        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          structuredContent: result,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return {
          content: [
            {
              type: "text",
              text: `Error fetching balance: ${message}. Check that the RPC is available and the address is correct.`,
            },
          ],
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

      const chains = Object.keys(SUPPORTED_CHAINS) as Array<
        keyof typeof SUPPORTED_CHAINS
      >;
      const results: unknown[] = [];
      const errors: string[] = [];

      await Promise.allSettled(
        chains.map(async (chain) => {
          try {
            const provider = getProvider(chain);
            const chainConfig = getChainConfig(chain);

            if (!params.token) {
              const balanceWei = await provider.getBalance(params.wallet);
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
              const [balance, decimals, symbol] = await Promise.all([
                contract.balanceOf(params.wallet) as Promise<bigint>,
                contract.decimals() as Promise<number>,
                contract.symbol() as Promise<string>,
              ]);

              results.push({
                chain: chainConfig.name,
                token: symbol,
                balance: formatTokenAmount(balance, decimals, symbol),
                balanceRaw: balance.toString(),
              });
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown";
            errors.push(`${chain}: ${message}`);
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
