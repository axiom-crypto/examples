import dotenv from "dotenv";
dotenv.config();
import { MyCircuitInputs, myCircuitCode } from "./circuit";
import { ethers, keccak256 } from "ethers";
import { AxiomCircuit } from "@axiom-crypto/client/js";
import { HexString } from "ethers/lib.commonjs/utils/data";

/// **Assuming** that your `key` is of uint type so it is left padded to 32 bytes.
function getRawSlotForMapping(
  mappingSlot: HexString,
  key: HexString,
  offset: number
): HexString {
  // See https://docs.soliditylang.org/en/v0.8.23/internals/layout_in_storage.html#mappings-and-dynamic-arrays
  const p = ethers.zeroPadValue(mappingSlot, 32);
  const k = ethers.zeroPadValue(key, 32);
  const slot = keccak256(ethers.concat([k, p]));
  const offsetSlot = ethers.toBigInt(slot) + BigInt(offset);
  return ethers.toBeHex(offsetSlot, 32);
}

async function generateQueryWithExtraData(
  compiledCircuit: AxiomCircuit<MyCircuitInputs>,
  blockNumber: number,
  mappingSlot: HexString,
  key: HexString,
  offset: number,
  callbackAddr: string,
  senderAddr: string
) {
  // This is a calculation purely in Typescript. It cannot be trusted since it's outside the circuit!
  const offsetSlot = getRawSlotForMapping(mappingSlot, key, offset);
  // We pass the inputs of the `getRawSlotForMapping` as extra data to the callback contract. In that contract we will perform the same function in Solidity to verify that this part of the calculation was done correctly.
  const callback = {
    target: callbackAddr,
    extraData: ethers.concat([
      ethers.zeroPadValue(mappingSlot, 32),
      ethers.zeroPadValue(key, 32),
      ethers.toBeHex(offset, 32),
    ]),
  };
  const input = {
    blockNumber,
    rawSlot: offsetSlot,
  };
  await compiledCircuit.run(input);

  return compiledCircuit.getSendQueryArgs({
    callbackAddress: callback.target,
    callbackExtraData: callback.extraData,
    callerAddress: senderAddr,
    options: { refundee: senderAddr },
  });
}

const axiomMain = async () => {
  const circuit = new AxiomCircuit({
    provider: process.env.PROVIDER_URI_GOERLI as string,
    f: myCircuitCode,
    chainId: 5,
    mock: true,
  });
  const defaultInputs = {
    blockNumber: 10023211,
    rawSlot: ethers.ZeroHash,
  };
  const artifact = await circuit.compile(defaultInputs);
  console.log(artifact);
  // Instead of compiling, you can load from a saved artifact:
  await circuit.loadSaved({ config: artifact.config, vk: artifact.vk });

  // The following part creates a ZK proof from a variable input and builds the query for you to send on-chain.
  // We'll just do an example input here:
  const test = {
    blockNumber: 10051661,
    // To find the slot of a mapping, use the following command:
    // $ forge inspect <contract> storage-layout --pretty
    mappingSlot: ethers.toBeHex(300), // slot 300 of AxiomV2Query is `mapping(uint256 => AxiomQueryMetadata) public queries`
    queryId: 66966676587627506390515603527468953886054461497745819784183473907733311885447n,
    offset: 1, // offset 1 should be the `payment` field in `AxiomQueryMetadata`
  };

  const provider = new ethers.JsonRpcProvider(process.env
    .PROVIDER_URI_GOERLI as string);
  const signer = new ethers.Wallet(
    process.env.PRIVATE_KEY_GOERLI as string,
    provider
  );
  const deployedCallbackAddr = "0x973aBC20172BA768B2285DA76CCc18741f7fBA0D";
  const {
    address: axiomV2QueryMockAddr,
    abi,
    args,
    value,
    queryId,
  } = await generateQueryWithExtraData(
    circuit,
    test.blockNumber,
    test.mappingSlot,
    ethers.toBeHex(test.queryId, 32),
    test.offset,
    deployedCallbackAddr,
    signer.address
  );
  console.log("Query built with the following args:", args);

  const axiomV2QueryMock = new ethers.Contract(
    axiomV2QueryMockAddr,
    abi,
    signer
  );

  console.log(
    "Sending a Query to AxiomV2QueryMock with payment amount (wei):",
    value
  );
  const tx = await axiomV2QueryMock.sendQuery(...args, { value });
  const receipt: ethers.ContractTransactionReceipt = await tx.wait();
  console.log("Transaction receipt:", receipt);

  console.log(
    "View your Query on Axiom Explorer:",
    `https://explorer.axiom.xyz/v2/goerli/mock/query/${queryId}`
  );
};

axiomMain();
