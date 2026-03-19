// src/services/chain.ts
import { ethers } from "ethers";
import { SUPPORTED_CHAINS, ChainName } from "./constants.js";

export function getProvider(chain: ChainName): ethers.JsonRpcProvider {
  const config = SUPPORTED_CHAINS[chain];
  return new ethers.JsonRpcProvider(config.rpcUrl, config.chainId);
}

export function getChainConfig(chain: ChainName) {
  return SUPPORTED_CHAINS[chain];
}

export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

export function formatTokenAmount(
  amount: bigint,
  decimals: number,
  symbol: string
): string {
  const formatted = ethers.formatUnits(amount, decimals);
  // Ondalık kısımı temizle — gereksiz sıfırları kaldır
  const clean = parseFloat(formatted).toString();
  return `${clean} ${symbol}`;
}

export function parseTokenAmount(amount: string, decimals: number): bigint {
  return ethers.parseUnits(amount, decimals);
}

export function calculateFee(amountWei: bigint, bps: number): bigint {
  return (amountWei * BigInt(bps)) / BigInt(10000);
}
