import {
  Axiom,
  AxiomConfig,
  DataQueryRequestV2,
  QueryV2,
  getFunctionSelector,
  getMappingValues,
  getTxFieldIdx,
} from '@axiom-crypto/experimental';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

/**
 * This example 
 */

const GOERLI_WETH_ADDR = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

const config: AxiomConfig = {
  providerUri: process.env.PROVIDER_URI_GOERLI as string,
  privateKey: process.env.PRIVATE_KEY as string,
  version: "v2",
  chainId: 5,
}
const axiom = new Axiom(config);
const axiomQuery = axiom.query as QueryV2;

async function main() {
  // Assemble the dataQuery
  const wethHolders = [
    "0x3E9C9bc3e7d088B534b7Ad83e307196E00E57B85",
    // "0x2f0b23f53734252bda2277357e97e1517d6b042a",
    // "0x030ba81f1c18d280636f32af80b9aad02cf0854e",
    // "0xc3d688b66703497daa19211eedff47f25384cdc3",
    // "0x08638ef1a205be6762a8b935f5da9b700cf7322c",
    // "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed",
    // "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
    // "0x4d5f47fa6a74757f35c14fd3a6ef8e3c9bc514e8",
    // "0x8eb8a3b98659cce290402893d0123abb75e3ab28",
    // "0xba12222222228d8ba445958a75a0704d566bf2c8",
  ];
  const dataQuery = getMappingValues(8000000, GOERLI_WETH_ADDR, "3", "address", wethHolders);

  // Assemble the on-chain callback params
  const callback = {
    callbackAddr: "0x846b0368fb1f410cd5E0E3EF87144927575fF9c6",
    callbackFunctionSelector: getFunctionSelector("increment", []),
    resultLen: 1,
    callbackExtraData: ethers.ZeroHash,
  };

  const query = await axiomQuery.new(
    dataQuery,  // dataQuery
    undefined,  // computeQuery (none, in this case)
    callback,   // onchainCallback
  );
  await query.build();
  const builtQuery = query.getBuiltQuery();
  console.log("dataQueryHash", builtQuery?.dataQueryHash);
  const builtDq = query.getDataQuery();
  console.log(builtDq);

  const payment = query.calculateFee();
  await query.sendOnchainQuery(payment, (receipt) => {
    console.log("receipt", receipt);
  });
}

main();