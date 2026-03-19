#!/usr/bin/env node
// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerBalanceTool, registerAllBalancesTool } from "./balance.js";
import { registerTransferTool } from "./transfer.js";
import { registerGasTool, registerWatchTxTool } from "./gas.js";
import { FEE_CONFIG } from "./constants.js";

const server = new McpServer({
  name: "wallet-mcp-server",
  version: "1.0.0",
});

// Tüm tool'ları kaydet
registerBalanceTool(server);
registerAllBalancesTool(server);
registerTransferTool(server);
registerGasTool(server);
registerWatchTxTool(server);

// Fee wallet kontrolü
if (!FEE_CONFIG.recipient) {
  console.error(
    "⚠️  Warning: FEE_WALLET env variable not set. Platform fee collection disabled."
  );
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("✅ wallet-mcp-server running (stdio)");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
