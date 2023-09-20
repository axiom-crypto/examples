import dotenv from 'dotenv';
dotenv.config();

export const Constants = Object.freeze({
  COVALENT_BASE_URI: "https://api.covalenthq.com/v1",
  COVALENT_API_KEY: process.env.COVALENT_API_KEY as string,
  UNISWAP_V2_GOERLI_ROUTER: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD".toLowerCase(),
})