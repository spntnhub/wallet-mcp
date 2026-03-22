import { SUPPORTED_CHAINS } from "./constants.js";
import { Request, Response, NextFunction } from "express";

// Express endpoint: /api/chain-info/:chain
export function chainInfoEndpoint(req: Request, res: Response, next: NextFunction) {
  let chainKey: string;
  if (Array.isArray(req.params.chain)) {
    chainKey = req.params.chain[0];
  } else {
    chainKey = req.params.chain;
  }
  if (!Object.prototype.hasOwnProperty.call(SUPPORTED_CHAINS, chainKey)) {
    return res.status(404).json({ error: true, code: "CHAIN_NOT_FOUND", message: `Chain '${chainKey}' not found.` });
  }
  const info = SUPPORTED_CHAINS[chainKey as keyof typeof SUPPORTED_CHAINS];
  res.json({
    chain: chainKey,
    ...info
  });
}
