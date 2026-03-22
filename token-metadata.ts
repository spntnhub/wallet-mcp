import { ethers } from "ethers";
import { ERC20_ABI } from "./constants.js";

/**
 * Zincirden token metadata'sını (ad, sembol, desimal) çeker.
 * Sonuçları cache'leyerek AI için hızlı erişim sağlar.
 */
const tokenMetaCache = new Map<string, { name: string; symbol: string; decimals: number }>();

export async function fetchTokenMetadata(provider: ethers.JsonRpcProvider, tokenAddress: string) {
  if (tokenMetaCache.has(tokenAddress)) {
    return tokenMetaCache.get(tokenAddress);
  }
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const [name, symbol, decimals] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals()
  ]);
  const meta = { name, symbol, decimals };
  tokenMetaCache.set(tokenAddress, meta);
  return meta;
}
