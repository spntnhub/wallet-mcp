import { SUPPORTED_CHAINS } from "./constants.js";

/**
 * Zincir ve token parametrelerinden token adresini çözer.
 * Hatalı parametrelerde hata mesajı döner.
 */
export function resolveTokenAddress(chain: keyof typeof SUPPORTED_CHAINS, token?: string): { address?: string, error?: string } {
  const chainConfig = SUPPORTED_CHAINS[chain];
  if (!token) return { address: undefined };
  if (token.startsWith("0x")) return { address: token };
  const upperToken = token.toUpperCase();
  const chainTokens = chainConfig.tokens as Record<string, string>;
  if (!chainTokens[upperToken]) {
    return {
      error: `Token \"${token}\" not found on ${chainConfig.name}. Use a contract address or one of: ${Object.keys(chainTokens).join(", ")}`
    };
  }
  return { address: chainTokens[upperToken] };
}
