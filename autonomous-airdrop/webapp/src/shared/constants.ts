export const Constants = Object.freeze({
  EXPLORER_BASE_URL: "https://explorer.axiom.xyz/v2/goerli/query/",
  COVALENT_BASE_URI: "https://api.covalenthq.com/v1",
  COVALENT_API_KEY: process.env.COVALENT_API_KEY as string,
  UNISWAP_UNIV_ROUTER_GOERLI: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD".toLowerCase(),

  AUTO_AIRDROP_ADDR: "0x5350463E8dA9e06f21b09e259fb3edD277E1F644",
  TOKEN_ADDR: "0x20BCbd71Ef4C9cfA22330C2D0E5Ed654D20AeC7A",
  
  // Swap (address sender, address recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)
  EVENT_SCHEMA: "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67",
  ELIGIBLE_BLOCK_HEIGHT: 9000000,
})