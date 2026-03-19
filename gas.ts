// src/tools/gas.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ethers } from "ethers";
import { z } from "zod";
import { getProvider, getChainConfig } from "./chain.js";

const GetGasSchema = z.object({
  chain: z
    .enum(["ethereum", "polygon", "base"])
    .default("polygon")
    .describe("Blockchain network to get gas price for"),
});

export function registerGasTool(server: McpServer): void {
  server.registerTool(
    "wallet_get_gas_price",
    {
      title: "Get Current Gas Price",
      description: `Get the current gas price on a blockchain network.

Args:
  - chain: Network — 'ethereum', 'polygon', or 'base' (default: 'polygon')

Returns:
  {
    "chain": string,
    "gasPriceGwei": string,      // Gas price in Gwei
    "gasPriceWei": string,       // Gas price in Wei
    "estimatedTransferCost": string  // Estimated cost for a simple transfer
  }`,
      inputSchema: GetGasSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const provider = getProvider(params.chain);
        const chainConfig = getChainConfig(params.chain);
        const feeData = await provider.getFeeData();

        const gasPrice = feeData.gasPrice ?? feeData.maxFeePerGas ?? BigInt(0);
        const transferGas = BigInt(21000);
        const estimatedCost = gasPrice * transferGas;

        const result = {
          chain: chainConfig.name,
          gasPriceGwei: ethers.formatUnits(gasPrice, "gwei"),
          gasPriceWei: gasPrice.toString(),
          estimatedTransferCost: `${ethers.formatEther(estimatedCost)} ${chainConfig.nativeToken}`,
          baseFeeGwei: feeData.maxFeePerGas
            ? ethers.formatUnits(feeData.maxFeePerGas, "gwei")
            : null,
        };

        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          structuredContent: result,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return {
          content: [{ type: "text", text: `Error getting gas price: ${message}` }],
        };
      }
    }
  );
}

const WatchTxSchema = z.object({
  txHash: z
    .string()
    .describe("Transaction hash to check (0x...)"),
  chain: z
    .enum(["ethereum", "polygon", "base"])
    .default("polygon")
    .describe("Blockchain network"),
});

export function registerWatchTxTool(server: McpServer): void {
  server.registerTool(
    "wallet_get_transaction",
    {
      title: "Get Transaction Status",
      description: `Check the status and details of a blockchain transaction.

Args:
  - txHash (string): Transaction hash starting with 0x
  - chain (string): Network — 'ethereum', 'polygon', or 'base' (default: 'polygon')

Returns:
  {
    "txHash": string,
    "chain": string,
    "status": "confirmed" | "pending" | "failed" | "not_found",
    "blockNumber": number | null,
    "confirmations": number,
    "from": string,
    "to": string,
    "value": string,
    "gasUsed": string | null,
    "explorerUrl": string
  }`,
      inputSchema: WatchTxSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const provider = getProvider(params.chain);
        const chainConfig = getChainConfig(params.chain);

        const [tx, receipt] = await Promise.all([
          provider.getTransaction(params.txHash),
          provider.getTransactionReceipt(params.txHash),
        ]);

        if (!tx) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  txHash: params.txHash,
                  chain: chainConfig.name,
                  status: "not_found",
                  message: "Transaction not found. It may not have been broadcast yet.",
                }),
              },
            ],
          };
        }

        const currentBlock = await provider.getBlockNumber();
        const confirmations = receipt
          ? currentBlock - receipt.blockNumber
          : 0;

        const result = {
          txHash: params.txHash,
          chain: chainConfig.name,
          status: receipt
            ? receipt.status === 1
              ? "confirmed"
              : "failed"
            : "pending",
          blockNumber: receipt?.blockNumber ?? null,
          confirmations,
          from: tx.from,
          to: tx.to,
          value: `${ethers.formatEther(tx.value)} ${chainConfig.nativeToken}`,
          gasUsed: receipt ? receipt.gasUsed.toString() : null,
          explorerUrl: `${chainConfig.explorerUrl}/tx/${params.txHash}`,
        };

        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          structuredContent: result,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return {
          content: [{ type: "text", text: `Error fetching transaction: ${message}` }],
        };
      }
    }
  );
}
