import { Constants } from '@/shared/constants';
import {
  Axiom,
  AxiomConfig,
  AxiomV2Callback,
  HeaderField,
  HeaderSubquery,
  QueryV2,
  TxField,
  TxType,
  buildHeaderSubquery,
  buildReceiptSubquery,
  buildTxSubquery,
  bytes32,
  getFunctionSelector,
} from '@axiom-crypto/experimental';

export const buildAxiomQuery = async (
  address: string,
  txHash: string,
  blockNumber: number,
  logIdx: number,
) => {
  if (!address || !txHash || !blockNumber || !logIdx) {
    throw new Error("Invalid Uniswap V2 `Swap` event");
  }
  
  const config: AxiomConfig = {
    providerUri: process.env.PROVIDER_URI_GOERLI as string,
    version: "v2",
    chainId: 5,
  }
  const axiom = new Axiom(config);
  const query = (axiom.query as QueryV2).new();

  // Append a Receipt Subquery that gets the following event schema:
  // Swap(address,uint256,uint256,uint256,uint256,address)
  // 0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67
  let receiptSubquery = buildReceiptSubquery(txHash)
    .log(logIdx)
    .topic(0) // topic 0: event schema
    .eventSchema(Constants.EVENT_SCHEMA);
  query.appendDataSubquery(receiptSubquery);

  // Append a Receipt Subquery that checks the address recipient field
  receiptSubquery = buildReceiptSubquery(txHash)
    .log(logIdx)
    .topic(2) // topic 2: recipient
    .eventSchema(Constants.EVENT_SCHEMA);
  query.appendDataSubquery(receiptSubquery);

  // Append a Receipt Subquery that gets the block number of the transaction receipt
  receiptSubquery = buildReceiptSubquery(txHash)
    .blockNumber(); // block number of the transaction
  query.appendDataSubquery(receiptSubquery);

  // Append a Transaction Subquery that gets the `to` field of the transaction
  let txSubquery = buildTxSubquery(txHash)
    .field(TxField.To)
    .type(TxType.Eip1559);
  console.log(txSubquery);
  query.appendDataSubquery(txSubquery);

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
    callbackExtraData: bytes32(address),
  }
  query.setCallback(callback);

  // Validate the Query
  const isValid = await query.validate();
  console.log("isValid", isValid);

  // Build the Query
  const builtQuery = await query.build();
  
  // Calculate the payment
  const payment = await query.calculateFee();

  return {
    builtQuery,
    payment,
  };
}