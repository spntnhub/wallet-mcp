// src/tools/transfer.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ethers } from "ethers";
import { z } from "zod";
import {
  getProvider,
  getChainConfig,
  isValidAddress,
  parseTokenAmount,
  calculateFee,
} from "./chain.js";
import { ERC20_ABI, FEE_CONFIG } from "./constants.js";
import { resolveTokenAddress } from "./token-utils.js";
import { aiErrorResponse } from "./ai-error.js";

const TransferSchema = z.object({
  from: z.string().describe("Sender wallet address (0x...)"),
  to: z.string().describe("Recipient wallet address (0x...)"),
  amount: z
    .string()
    .describe('Amount to send in human-readable format (e.g. "10.5")'),
  chain: z
    .enum(["ethereum", "polygon", "base"])
    .default("polygon")
    .describe("Blockchain network"),
  token: z
    .string()
    .optional()
    .describe(
      "Token symbol (USDC, USDT) or ERC-20 contract address. Leave empty for native token (ETH/POL)"
    ),
});

type TransferInput = z.infer<typeof TransferSchema>;

export function registerTransferTool(server: McpServer): void {
  server.registerTool(
    "wallet_prepare_transfer",
    {
      title: "Prepare Token Transfer",
      description: `Prepare a token transfer transaction. Returns unsigned transaction data that the user must sign and broadcast with their wallet (MetaMask, etc.).

⚠️ This tool does NOT send transactions automatically. It prepares the transaction data for user confirmation.

A 0.2% platform fee is included automatically — split as a separate transfer to the fee wallet.

Args:
  - from (string): Sender wallet address
  - to (string): Recipient wallet address  
  - amount (string): Amount in human-readable format (e.g. "10.5")
  - chain (string): Network — 'ethereum', 'polygon', or 'base' (default: 'polygon')
  - token (string, optional): Token symbol or contract address. Empty = native token.

Returns:
  {
    "chain": string,
    "token": string,
    "from": string,
    "to": string,
    "amount": string,
    "fee": { "amount": string, "recipient": string, "bps": number },
    "transactions": [
      {
        "step": number,
        "description": string,
        "to": string,
        "data": string,
        "value": string,    // in wei
        "gasEstimate": string
      }
    ],
    "instructions": string   // Human-readable next steps
  }

Examples:
  - "Send 5 POL to 0x123..." → { "from": "0x...", "to": "0x123...", "amount": "5", "chain": "polygon" }
  - "Transfer 100 USDC on Base" → { "from": "0x...", "to": "0x...", "amount": "100", "chain": "base", "token": "USDC" }
  - "AI chaining: Send 5 USDC from 0xA to 0xB on Polygon, ardından bakiyemi kontrol et." → [ { "step": "prepare_transfer", ... }, { "step": "get_balance", ... } ]
  - Hatalı prompt: "Send 1000 BTC to 0xC on Polygon" → { "error": "TOKEN_NOT_FOUND", ... }
`,
      inputSchema: TransferSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params: TransferInput) => {
      // Adres validasyonu
      if (!isValidAddress(params.from)) {
        return aiErrorResponse(
          "INVALID_SENDER_ADDRESS",
          `Invalid sender address: ${params.from}`,
          { from: params.from },
          "Lütfen 0x ile başlayan geçerli bir gönderen adresi girin."
        );
      }
      if (!isValidAddress(params.to)) {
        return aiErrorResponse(
          "INVALID_RECIPIENT_ADDRESS",
          `Invalid recipient address: ${params.to}`,
          { to: params.to },
          "Lütfen 0x ile başlayan geçerli bir alıcı adresi girin."
        );
      }

      try {
        const provider = getProvider(params.chain);
        const chainConfig = getChainConfig(params.chain);
        const transactions = [];

        if (!params.token) {
          // Native token transfer (ETH / POL)
          const amountWei = ethers.parseEther(params.amount);
          const feeWei = FEE_CONFIG.recipient
            ? calculateFee(amountWei, FEE_CONFIG.bps)
            : BigInt(0);

          // Gas tahmini
          const gasEstimate = await provider.estimateGas({
            from: params.from,
            to: params.to,
            value: amountWei - feeWei,
          });

          transactions.push({
            step: 1,
            description: `Send ${params.amount} ${chainConfig.nativeToken} to recipient`,
            to: params.to,
            data: "0x",
            value: (amountWei - feeWei).toString(),
            gasEstimate: gasEstimate.toString(),
          });

          if (feeWei > BigInt(0) && FEE_CONFIG.recipient) {
            transactions.push({
              step: 2,
              description: `Platform fee (0.2%)`,
              to: FEE_CONFIG.recipient,
              data: "0x",
              value: feeWei.toString(),
              gasEstimate: "21000",
            });
          }

          const result = {
            chain: chainConfig.name,
            token: chainConfig.nativeToken,
            from: params.from,
            to: params.to,
            amount: `${params.amount} ${chainConfig.nativeToken}`,
            fee: {
              amount: `${ethers.formatEther(feeWei)} ${chainConfig.nativeToken}`,
              recipient: FEE_CONFIG.recipient || "not configured",
              bps: FEE_CONFIG.bps,
            },
            transactions,
            instructions:
              "Sign and broadcast each transaction in order using your wallet (MetaMask, WalletConnect, etc.). Make sure you are connected to " +
              chainConfig.name,
          };

          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            structuredContent: result,
          };
        }


        // ERC-20 token transfer
        const { address: tokenAddress, error } = resolveTokenAddress(params.chain, params.token);
        if (error) {
          return aiErrorResponse(
            "TOKEN_NOT_FOUND",
            error,
            { chain: params.chain, token: params.token }
          );
        }

        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const [decimals, symbol] = await Promise.all([
          contract.decimals() as Promise<number>,
          contract.symbol() as Promise<string>,
        ]);

        const amountRaw = parseTokenAmount(params.amount, decimals);
        const feeRaw = FEE_CONFIG.recipient
          ? calculateFee(amountRaw, FEE_CONFIG.bps)
          : BigInt(0);
        const amountAfterFee = amountRaw - feeRaw;

        // Transfer calldata
        const iface = new ethers.Interface(ERC20_ABI);
        const transferData = iface.encodeFunctionData("transfer", [
          params.to,
          amountAfterFee,
        ]);
        const feeTransferData =
          feeRaw > BigInt(0) && FEE_CONFIG.recipient
            ? iface.encodeFunctionData("transfer", [
                FEE_CONFIG.recipient,
                feeRaw,
              ])
            : null;

        // Gas tahmini
        const gasEstimate = await provider.estimateGas({
          from: params.from,
          to: tokenAddress,
          data: transferData,
        });

        transactions.push({
          step: 1,
          description: `Transfer ${ethers.formatUnits(amountAfterFee, decimals)} ${symbol} to recipient`,
          to: tokenAddress,
          data: transferData,
          value: "0",
          gasEstimate: gasEstimate.toString(),
        });

        if (feeTransferData && feeRaw > BigInt(0)) {
          transactions.push({
            step: 2,
            description: `Platform fee (0.2%) — ${ethers.formatUnits(feeRaw, decimals)} ${symbol}`,
            to: tokenAddress,
            data: feeTransferData,
            value: "0",
            gasEstimate: "65000",
          });
        }

        const result = {
          chain: chainConfig.name,
          token: symbol,
          tokenAddress,
          from: params.from,
          to: params.to,
          amount: `${params.amount} ${symbol}`,
          fee: {
            amount: `${ethers.formatUnits(feeRaw, decimals)} ${symbol}`,
            recipient: FEE_CONFIG.recipient || "not configured",
            bps: FEE_CONFIG.bps,
          },
          transactions,
          instructions:
            "Sign and broadcast each transaction in order using your wallet. Make sure you are connected to " +
            chainConfig.name,
        };

        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          structuredContent: result,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return aiErrorResponse(
          "TRANSFER_PREPARE_ERROR",
          `Error preparing transfer: ${message}`,
          { params }
        );
      }
    }
  );
}
