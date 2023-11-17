import dotenv from "dotenv";
import axios from "axios";
dotenv.config();
import { MyAxiomCircuit } from "./circuit";
import { MyInputs, myCircuitFn } from "./circuit/circuit";
import { ZeroHash, ethers, keccak256 } from "ethers";
import {
  Axiom,
  BuiltQueryV2,
  QueryBuilderV2,
  bytes32,
} from "@axiom-crypto/core";
import { HexString } from "ethers/lib.commonjs/utils/data";

// Axiom SDK
const axiom = new Axiom({
  providerUri: process.env.PROVIDER_URI_GOERLI as string,
  privateKey: process.env.PRIVATE_KEY_GOERLI as string,
  version: "v2",
  chainId: 5, // Goerli
  mock: true, // generate Mock proofs for faster development
});

const defaultInputs: MyInputs = {
  blockNumber: 10023211,
  rawSlot: ZeroHash,
};

/// **Assuming** that your `key` is of uint type so it is left padded to 32 bytes.
function getRawSlotForMapping(
  mappingSlot: HexString,
  key: HexString,
  offset: number,
): HexString {
  // See https://docs.soliditylang.org/en/v0.8.23/internals/layout_in_storage.html#mappings-and-dynamic-arrays
  const p = ethers.zeroPadValue(mappingSlot, 32);
  const k = ethers.zeroPadValue(key, 32);
  const slot = keccak256(ethers.concat([k, p]));
  const offsetSlot = ethers.toBigInt(slot) + BigInt(offset);
  return ethers.toBeHex(offsetSlot, 32);
}

async function generateQueryWithExtraData(
  loadedCircuit: MyAxiomCircuit,
  blockNumber: number,
  mappingSlot: HexString,
  key: HexString,
  offset: number,
  callbackAddr: string,
): Promise<{
  query: QueryBuilderV2;
  builtQuery: BuiltQueryV2;
  payment: string;
}> {
  // This is a calculation purely in Typescript. It cannot be trusted since it's outside the circuit!
  const offsetSlot = getRawSlotForMapping(mappingSlot, key, offset);
  // We pass the inputs of the `getRawSlotForMapping` as extra data to the callback contract. In that contract we will perform the same function in Solidity to verify that this part of the calculation was done correctly.
  const callback = {
    target: callbackAddr,
    extraData: ethers.concat([
      bytes32(mappingSlot),
      bytes32(key),
      bytes32(offset),
    ]),
  };
  const input = {
    blockNumber,
    rawSlot: offsetSlot,
  };
  await loadedCircuit.run(input);
  return loadedCircuit.generateQuery(axiom, callback);
}

const axiomMain = async () => {
  const customCircuit = new MyAxiomCircuit(
    process.env.PROVIDER_URI_GOERLI as string,
    myCircuitFn,
  );
  await customCircuit.setup();

  // This only needs to be done once to lock the structure of your circuit.
  await customCircuit.build(defaultInputs);
  const querySchema = customCircuit.getQuerySchema();
  console.log("Query schema: ", querySchema);

  // In production, you should save the proving key and verifying key to disk and build from the cached proving key by calling `customCircuit.loadPrebuilt(config, pkey, vkey)`.

  // The following part creates a ZK proof from a variable input and builds the query for you to send on-chain.
  // We'll just do an example input here:
  const test = {
    blockNumber: 10051661,
    // To find the slot of a mapping, use the following command:
    // $ forge inspect <contract> storage-layout --pretty
    mappingSlot: ethers.toBeHex(300), // slot 300 of AxiomV2Query is `mapping(uint256 => AxiomQueryMetadata) public queries`
    queryId:
      66966676587627506390515603527468953886054461497745819784183473907733311885447n,
    offset: 1, // offset 1 should be the `payment` field in `AxiomQueryMetadata`
  };
  const { query, builtQuery, payment } = await generateQueryWithExtraData(
    customCircuit,
    test.blockNumber,
    test.mappingSlot,
    ethers.toBeHex(test.queryId, 32),
    test.offset,
    "0x4737243a3134e0af5cd8a8eAe457B4A1706FD411",
  );
  console.log("Query built with the following params:", builtQuery);

  const dummyCaller = ethers.toBeHex(1, 20);
  const queryId = await query.getQueryId(dummyCaller);
  // console.log(
  //   "About to send query to proof API. Watch the status of your query on Axiom Explorer:",
  //   `https://explorer.axiom.xyz/v2/goerli/mock/query/${queryId}`,
  // );

  let data;
  try {
    const res = await axios.post("http://3.228.218.105:8005/v2/query_proofs", {
      packedDataQuery: builtQuery.dataQuery,
      dataQueryHash: builtQuery.dataQueryHash,
      computeQuery: builtQuery.computeQuery,
      callback: builtQuery.callback,
      sourceChainId: builtQuery.sourceChainId,
      userSalt: builtQuery.userSalt,
      maxFeePerGas: builtQuery.maxFeePerGas,
      callbackGasLimit: builtQuery.callbackGasLimit,
      caller: dummyCaller,
      refundee: dummyCaller,
      queryId: queryId,
      mock: true,
    });
    data = res.data;
  } catch (e) {
    const error = e as any;
    if (error.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      console.error(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error", error.message);
    }
    throw new Error("Failed to generate proof");
  }

  console.log("Proof generated: ");
  console.log(data);

  /*console.log(
    "Sending a Query to AxiomV2QueryMock with payment amount (wei):",
    payment,
  );

  const queryId = await query.sendOnchainQuery(
    payment,
    (receipt: ethers.ContractTransactionReceipt) => {
      // You can do something here once you've received the receipt
      console.log("receipt", receipt);
    },
  );
  */
};

axiomMain();
