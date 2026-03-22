
// src/constants.ts
import fs from "fs";
import path from "path";

const chainsPath = path.resolve(__dirname, "./chains.json");
const chainsRaw = fs.readFileSync(chainsPath, "utf-8");
export const SUPPORTED_CHAINS = JSON.parse(chainsRaw);
export type ChainName = keyof typeof SUPPORTED_CHAINS;

// Fee config — %0.2 platform fee
export const FEE_CONFIG = {
  bps: 20, // 0.20% = 20 basis points
  recipient: process.env.FEE_WALLET || "",
  description: "0.2% platform fee",
};

// ERC-20 ABI — minimal, sadece ihtiyacımız olanlar
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

export const CHARACTER_LIMIT = 10000;
