import { SUPPORTED_CHAINS } from "./constants.js";
import { Request, Response, NextFunction } from "express";

// Express endpoint: /api/chain-info/:chain
export function chainInfoEndpoint(req: Request, res: Response, next: NextFunction) {
  const { chain } = req.params;
  const info = SUPPORTED_CHAINS[chain];
  if (!info) {
    return res.status(404).json({ error: true, code: "CHAIN_NOT_FOUND", message: `Chain '${chain}' not found.` });
  }
  res.json({
    chain,
    ...info
  });
}
