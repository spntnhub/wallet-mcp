// src/constants.ts

export const SUPPORTED_CHAINS = {
  ethereum: {
    name: "Ethereum Mainnet",
    chainId: 1,
    rpcUrl: process.env.ETH_RPC_URL || "https://eth.llamarpc.com",
    nativeToken: "ETH",
    explorerUrl: "https://etherscan.io",
    tokens: {
      USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    },
  },
  polygon: {
    name: "Polygon Mainnet",
    chainId: 137,
    rpcUrl: process.env.POLYGON_RPC_URL || "https://polygon.llamarpc.com",
    nativeToken: "POL",
    explorerUrl: "https://polygonscan.com",
    tokens: {
      USDC: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    },
  },
  base: {
    name: "Base Mainnet",
    chainId: 8453,
    rpcUrl: process.env.BASE_RPC_URL || "https://mainnet.base.org",
    nativeToken: "ETH",
    explorerUrl: "https://basescan.org",
    tokens: {
      USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      WETH: "0x4200000000000000000000000000000000000006",
    },
  },
} as const;

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
