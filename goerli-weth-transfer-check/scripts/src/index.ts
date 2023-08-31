import { Axiom, AxiomConfig, DataQueryRequestV2, QueryV2, ReceiptField, getReceiptFieldIdx, getFunctionSelector } from '@axiom-crypto/experimental';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

/**
 * This example let's a user submit a proof that they've transferred WETH at some point on Goerli.
 */

const GOERLI_WETH_ADDR = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
const CALLBACK_CONTRACT_ADDR = "";

const config: AxiomConfig = {
  providerUri: process.env.PROVIDER_URI_GOERLI as string,
  privateKey: process.env.PRIVATE_KEY as string,
  version: "v2",
  chainId: 5,
}
const axiom = new Axiom(config);
const axiomQuery = axiom.query as QueryV2;

async function main() {
  // Get txHash of Goerli WETH `Transfer` event
  //   Transfer(index_topic_1 address src, index_topic_2 address dst, uint256 wad)
  //   0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef

  // txHash of Goerli WETH `Transfer` event containing my `src` address
  const txHash = "0x48ec8cb5f934664d26c0cf435e2f7c924ef757ab4c84b20e7320e21f468551b7";

  // Build the dataQuery request
  const dataQuery: DataQueryRequestV2 = {
    receiptSubqueries: [
      {
        txHash,
        fieldOrLogIdx: getReceiptFieldIdx(ReceiptField.Logs),
        topicOrDataIdx: 1,
        eventSchema: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      }
    ]
  };

  // Build the on-chain callback params
  const callback = {
    callbackAddr: "0xe6fB74837117C38093dfcdFfee527a6Af151DEc8",
    callbackFunctionSelector: getFunctionSelector("validate", ["address"]),
    resultLen: 1,
    callbackExtraData: ethers.ZeroHash,
  };

  // Create a new Query and build it
  const query = await axiomQuery.new(dataQuery, undefined, callback);
  await query.build();

  // Calculate the fee to submit the Query
  const payment = await query.calculateFee();

  // Send the Query on-chain
  await query.sendOnchainQuery(payment, (receipt) => {
    console.log("receipt", receipt);
  });
}

main();