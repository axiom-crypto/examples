import dotenv from "dotenv";
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
  verificationKey: "0x1E27090e6842a20b3dAF4621AFD20D44479d780b",
  keystoreContractAddress: "0x05870fA27656036ecD754667edD2e91f81590f39",
  blockNumber: 10067126,
};

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

  await customCircuit.run(defaultInputs);
};

axiomMain();
