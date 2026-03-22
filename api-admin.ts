
import { aiErrorResponse } from "./ai-error.js";

const CHAINS_PATH = path.resolve(__dirname, "./chains.json");

// Express endpoint: /api/admin/add-chain (POST)
export function addChainEndpoint(req: Request, res: Response, next: NextFunction) {
  const { chainKey, chainData } = req.body;
  if (!chainKey || !chainData) {
    return res.status(400).json(aiErrorResponse(
      "INVALID_INPUT",
      "chainKey and chainData required",
      { chainKey, chainData },
      "Örnek: { chainKey: 'polygon', chainData: { ... } } gönderin."
    ));
  }
  const chainsRaw = fs.readFileSync(CHAINS_PATH, "utf-8");
  const chains = JSON.parse(chainsRaw);
  if (chains[chainKey]) {
    return res.status(409).json(aiErrorResponse(
      "CHAIN_EXISTS",
      `Chain '${chainKey}' already exists.`,
      { chainKey },
      "Farklı bir chainKey ile tekrar deneyin."
    ));
  }
  chains[chainKey] = chainData;
  fs.writeFileSync(CHAINS_PATH, JSON.stringify(chains, null, 2));
  res.json({ success: true, chainKey });
}

// Express endpoint: /api/admin/add-token (POST)
export function addTokenEndpoint(req: Request, res: Response, next: NextFunction) {
  const { chainKey, tokenSymbol, tokenAddress } = req.body;
  if (!chainKey || !tokenSymbol || !tokenAddress) {
    return res.status(400).json(aiErrorResponse(
      "INVALID_INPUT",
      "chainKey, tokenSymbol, tokenAddress required",
      { chainKey, tokenSymbol, tokenAddress },
      "Örnek: { chainKey: 'polygon', tokenSymbol: 'USDC', tokenAddress: '0x...' } gönderin."
    ));
  }
  const chainsRaw = fs.readFileSync(CHAINS_PATH, "utf-8");
  const chains = JSON.parse(chainsRaw);
  if (!chains[chainKey]) {
    return res.status(404).json(aiErrorResponse(
      "CHAIN_NOT_FOUND",
      `Chain '${chainKey}' not found.`,
      { chainKey },
      "Önce zinciri ekleyin, sonra token ekleyin."
    ));
  }
  chains[chainKey].tokens[tokenSymbol.toUpperCase()] = tokenAddress;
  fs.writeFileSync(CHAINS_PATH, JSON.stringify(chains, null, 2));
  res.json({ success: true, chainKey, tokenSymbol });
}
