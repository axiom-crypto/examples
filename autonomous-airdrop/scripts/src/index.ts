import {
  AccountField,
  Axiom,
  AxiomConfig,
  AxiomV2Callback,
  HeaderField,
  HeaderSubquery,
  QueryV2,
  ReceiptField,
  buildAccountSubquery,
  buildHeaderSubquery,
  buildReceiptSubquery,
  buildTxSubquery,
  bytes32,
  getFunctionSelector,
} from '@axiom-crypto/experimental';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

import { abi as AutonomousAirdropAbi } from './abi/AutonomousAirdrop.json';
import { findFirstUniswapTx } from './parseRecentTx';
import { Constants } from './constants';

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
  
  const autoAirdropContract = new ethers.Contract(
    Constants.AUTO_AIRDROP_ADDR, 
    AutonomousAirdropAbi, 
    wallet
  );

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
    .eventSchema(Constants.EVENT_SCHEMA);
  console.log(receiptSubquery);
  query.appendDataSubquery(receiptSubquery);
  receiptSubquery = buildReceiptSubquery(txHash)
    .log(logIdx)
    .topic(2) // topic 2: recipient
    .eventSchema(Constants.EVENT_SCHEMA);
  console.log(receiptSubquery);
  query.appendDataSubquery(receiptSubquery);
  receiptSubquery = buildReceiptSubquery(txHash)
    .blockNumber(); // block number of the transaction
  console.log(receiptSubquery);
  query.appendDataSubquery(receiptSubquery);

// Because each Query with the same subqueries can only be proven once, we are also 
// adding this random data subquery to this public example to ensure that everyone 
// who is using this Quickstart example can generate a proof
  const randomGoerliBlock = Math.floor(Math.random() * 9700000);
  const headerSubquery: HeaderSubquery = buildHeaderSubquery(randomGoerliBlock)
    .field(HeaderField.Number);
  query.appendDataSubquery(headerSubquery);

  const callback: AxiomV2Callback = {
    callbackAddr: Constants.AUTO_AIRDROP_ADDR,
    callbackFunctionSelector: getFunctionSelector("axiomV2Callback(uint64,address,bytes32,bytes32,bytes32[],bytes)"),
    resultLen: 3,
    callbackExtraData: bytes32(wallet.address),
  }
  query.setCallback(callback);

  // Validate the Query
  const isValid = await query.validate();
  console.log("isValid", isValid);

  // Build the Query
  const builtQuery = await query.build();
  
  // Calculate the payment
  const payment = await query.calculateFee();

  console.log("dataQuery:", builtQuery.dataQuery);
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
      dataQuery: builtQuery.dataQuery,
    }, 
    { value: payment }
  );
  const receipt = await tx.wait();
  console.log(receipt);
  console.log("Query submitted.");
}

async function main() {
  // Get first Uniswap tx for address
  const swapEvent = await findFirstUniswapTx(wallet.address);
  await sendQuery(swapEvent);
}

main();
