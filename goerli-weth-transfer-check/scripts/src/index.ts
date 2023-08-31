import { 
  Axiom,
  AxiomConfig,
  DataQueryRequestV2,
  QueryV2,
  ReceiptField,
  getReceiptFieldIdx,
  receiptUseLogIdx,
  getFunctionSelector,
} from '@axiom-crypto/experimental';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

/**
 * This example let's a user submit a proof that they've transferred WETH at some 
 * point on Goerli. A `Transfer` event can be emitted when, for example, a user 
 * swaps WETH for another asset on Goerli Uniswap.
 */

const GOERLI_WETH_ADDR = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
const CALLBACK_CONTRACT_ADDR = "0x2C5144E60Fec716D63D64c16999d3430Dfd33e3A";

const config: AxiomConfig = {
  providerUri: process.env.PROVIDER_URI_GOERLI as string,
  privateKey: process.env.PRIVATE_KEY as string,
  version: "v2",
  chainId: 5,
}
const axiom = new Axiom(config);
const axiomQuery = axiom.query as QueryV2;

async function main() {
  // Transfer(index_topic_1 address src, index_topic_2 address dst, uint256 wad) has
  // eventSchema: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef

  // txHash of Goerli WETH `Transfer` event containing my `src` address
  const txHash = "0x01396161a628053123ba63978279cfc28304b2c7ff2efda835efcc78072dd121";
  const eventSchema = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

  // Build the dataQuery request
  const dataQuery: DataQueryRequestV2 = {
    receiptSubqueries: [
      {
        txHash,
        fieldOrLogIdx: receiptUseLogIdx(2), // log index of `Transfer` event within that tx
        topicOrDataIdx: 1,
        eventSchema: eventSchema,
      }
    ]
  };

  // Build the on-chain callback params
  const callback = {
    callbackAddr: CALLBACK_CONTRACT_ADDR,
    callbackFunctionSelector: getFunctionSelector("validate", ["bytes32","address[]","bytes"]),
    resultLen: 1,
    callbackExtraData: eventSchema,
  };

  // Create a new Query with our dataQuery and on-chain callback and build it
  const query = await axiomQuery.new(
    dataQuery,  // dataQuery
    undefined,  // computeQuery (none, in this case)
    callback,   // onchainCallback
  );
  await query.build();

  // Log the dataQueryHash
  const builtQuery = query.getBuiltQuery();
  console.log("dataQueryHash", builtQuery?.dataQueryHash);

  // Calculate the fee required to submit the Query
  const payment = await query.calculateFee();

  // Send the Query on-chain
  await query.sendOnchainQuery(payment, (receipt) => {
    console.log("txReceipt", receipt);
  });
}

main();