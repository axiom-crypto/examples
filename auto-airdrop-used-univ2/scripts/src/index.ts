import {
  AccountField,
  Axiom,
  AxiomConfig,
  AxiomV2Callback,
  HeaderField,
  QueryV2,
  ReceiptField,
  buildAccountSubquery,
  buildHeaderSubquery,
  buildReceiptSubquery,
  buildTxSubquery,
  getFunctionSelector,
} from '@axiom-crypto/experimental';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

import { abi as AutoAirdropAbi } from './abi/AutoAirdrop.json';
import { findFirstUniswapTx } from './parseRecentTx';

// Swap (address sender, address recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)
const SWAP_EVENT_SCHEMA = "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67";
const AUTO_AIRDROP_ADDR = "0xf7d2A60cED0E9486fb4F718b89c6F6E99845de97";
const UNI_V2_ROUTER_GOERLI = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const privateKey = process.env.PRIVATE_KEY as string;
const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URI_GOERLI as string);
const wallet = new ethers.Wallet(privateKey, provider);

async function sendQuery(swapEvent: any) {
  console.log("swapEvent", swapEvent);
  const log = swapEvent?.log;
  const txHash = log?.tx_hash;
  const blockNumber = log?.block_height;
  const logIdx = swapEvent?.logIdx;
  if (!txHash || !blockNumber || !logIdx) {
    throw new Error("Invalid Uniswap V2 `Swap` event");
  }
  
  const autoAirdropContract = new ethers.Contract(AUTO_AIRDROP_ADDR, AutoAirdropAbi, wallet);

  const config: AxiomConfig = {
    providerUri: process.env.PROVIDER_URI_GOERLI as string,
    privateKey,
    version: "v2",
    chainId: 5,
  }
  const axiom = new Axiom(config);
  const query = (axiom.query as QueryV2).new();

  let receiptSubquery = buildReceiptSubquery(txHash)
    .log(logIdx)
    .topic(0) // topic 0: event schema
    .eventSchema(SWAP_EVENT_SCHEMA);
  console.log(receiptSubquery);
  query.appendDataSubquery(receiptSubquery);
  receiptSubquery = buildReceiptSubquery(txHash)
    .log(logIdx)
    .topic(2) // topic 2: recipient
    .eventSchema(SWAP_EVENT_SCHEMA);
  console.log(receiptSubquery);
  query.appendDataSubquery(receiptSubquery);
  receiptSubquery = buildReceiptSubquery(txHash)
    .blockNumber(); // block number of the transaction
  console.log(receiptSubquery);
  query.appendDataSubquery(receiptSubquery);

  const callback: AxiomV2Callback = {
    callbackAddr: "0x2C10dD5b654dEbD31342bB3f3e151D08401c0382",
    callbackFunctionSelector: getFunctionSelector("axiomV2Callback(uint64,address,bytes32,bytes32,bytes32[],bytes)"),
    resultLen: 3,
    callbackExtraData: wallet.address,
  }
  query.setCallback(callback);

  // Validate the Query
  const isValid = await query.validate();
  console.log("isValid", isValid);

  // Build the Query
  const builtQuery = await query.build();
  
  // Calculate the payment
  const payment = await query.calculateFee();

  console.log("dataQuery:", builtQuery.dataQueryEncoded);
  console.log("queryHash:", builtQuery.queryHash);

  // Submit Query to Airdrop contract
  const tx = await autoAirdropContract.claimAirdrop(
    {
      sourceChainId: builtQuery.sourceChainId,
      dataQueryHash: builtQuery.dataQueryHash,
      computeQuery: builtQuery.computeQuery,
      callback: builtQuery.callback,
      maxFeePerGas: builtQuery.maxFeePerGas,
      callbackGasLimit: builtQuery.callbackGasLimit,
      dataQuery: builtQuery.dataQueryEncoded,
    }, 
    { value: payment }
  );
  const receipt = await tx.wait();
  console.log(receipt);

  // Submit the Query
  // await query.sendOnchainQuery(query.calculateFee(), (receipt) => {
  //   console.log("receipt", receipt);
  //   console.log("queryHash", query.getQueryHash());
  // });
}

async function main() {
  // Get first Uniswap tx for address
  const swapEvent = await findFirstUniswapTx(wallet.address);
  await sendQuery(swapEvent);

  // console.log(`Sending query 0 for block ${blockNumber}...`);
  // await sendQuery(privateKey, blockNumber);
  // console.log(`Sending query 1 for block ${blockNumber}...`);
  // await sendQuery(privateKey1, blockNumber+1);
}

main();
